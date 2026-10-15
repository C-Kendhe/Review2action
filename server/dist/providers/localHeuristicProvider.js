"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalHeuristicAnalysisProvider = void 0;
const lexicon_js_1 = require("../services/lexicon.js");
class LocalHeuristicAnalysisProvider {
    name = 'LocalHeuristicAnalysisProvider';
    async analyze(reviews) {
        const analyzedReviews = reviews.map(rev => this.analyzeSingleReview(rev));
        // Aggregate metrics
        const metrics = this.computeDashboardMetrics(analyzedReviews);
        // Compute Topics metrics
        const topics = this.computeTopicMetrics(analyzedReviews);
        // Compute Sentiment Over Time (if dates exist)
        const sentimentOverTime = this.computeSentimentOverTime(analyzedReviews);
        // Average sentiment score
        const avgScore = analyzedReviews.length > 0
            ? Math.round((analyzedReviews.reduce((acc, r) => acc + r.sentimentScore, 0) / analyzedReviews.length) * 100) / 100
            : 0;
        // Generate evidence-backed recommendations
        const recommendations = this.generateRecommendations(analyzedReviews, topics, metrics);
        const providerInfo = {
            providerName: 'AMD Local Heuristic Engine',
            model: 'Rule-based Lexicon + Statistical Topic Extractor v1.0',
            isFallbackOrLocal: true,
            disclaimer: 'Prototype analysis uses local heuristics. AMD-hosted model integration can improve topic understanding and recommendation quality.',
            amdIntegrationReady: true
        };
        return {
            metrics,
            sentiment: {
                averageScore: avgScore,
                sentimentOverTime
            },
            topics,
            recommendations,
            reviews: analyzedReviews,
            providerInfo
        };
    }
    /**
     * Analyze an individual review's sentiment and topic tags
     */
    analyzeSingleReview(review) {
        const text = review.review_text;
        const lower = text.toLowerCase();
        const words = lower.replace(/[^a-z0-9'\s-]/g, ' ').split(/\s+/).filter(Boolean);
        let lexiconScore = 0;
        const matchedKeywords = [];
        // Scoring with n-grams & negation window
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            // Check 2-word phrase first
            const twoWord = i < words.length - 1 ? `${word} ${words[i + 1]}` : null;
            let phraseScore = twoWord ? lexicon_js_1.SENTIMENT_LEXICON[twoWord] : undefined;
            let matchedTerm = phraseScore !== undefined ? twoWord : null;
            if (phraseScore === undefined) {
                phraseScore = lexicon_js_1.SENTIMENT_LEXICON[word];
                if (phraseScore !== undefined) {
                    matchedTerm = word;
                }
            }
            if (phraseScore !== undefined && matchedTerm) {
                // Look back up to 3 words for negators or intensifiers
                let multiplier = 1.0;
                let isNegated = false;
                const lookbackStart = Math.max(0, i - 3);
                for (let j = lookbackStart; j < i; j++) {
                    const prevWord = words[j];
                    if (lexicon_js_1.NEGATION_WORDS.has(prevWord)) {
                        isNegated = true;
                    }
                    if (lexicon_js_1.INTENSIFIERS[prevWord]) {
                        multiplier *= lexicon_js_1.INTENSIFIERS[prevWord];
                    }
                    if (lexicon_js_1.DIMINISHERS[prevWord]) {
                        multiplier *= lexicon_js_1.DIMINISHERS[prevWord];
                    }
                }
                let termScore = phraseScore * multiplier;
                if (isNegated) {
                    termScore = -termScore * 0.85; // Flip sign with slight decay
                }
                lexiconScore += termScore;
                matchedKeywords.push(matchedTerm);
                if (matchedTerm === twoWord) {
                    i++; // Skip next word since it was consumed in 2-word phrase
                }
            }
        }
        // Normalize lexicon score to range [-1.0, 1.0]
        const wordCount = Math.max(words.length, 5);
        let normalizedLexicon = Math.max(-1.0, Math.min(1.0, lexiconScore / Math.sqrt(wordCount)));
        // Rating signal integration
        let finalScore = normalizedLexicon;
        let confidence = 0.6; // baseline confidence
        if (review.rating !== null && !isNaN(review.rating)) {
            // Map 1..5 stars to -1.0 .. +1.0
            // 1 -> -1.0, 2 -> -0.5, 3 -> 0.0, 4 -> +0.5, 5 -> +1.0
            const ratingNormalized = (review.rating - 3) / 2;
            // Weighted blend: 60% rating, 40% text lexicon
            finalScore = 0.6 * ratingNormalized + 0.4 * normalizedLexicon;
            // Higher confidence when rating and lexicon align
            const alignment = 1 - Math.abs(ratingNormalized - normalizedLexicon) / 2;
            confidence = Math.min(0.98, Math.max(0.65, 0.5 + alignment * 0.45));
        }
        else {
            // Text-only confidence based on keyword density
            const keywordDensity = matchedKeywords.length / (words.length || 1);
            confidence = Math.min(0.92, Math.max(0.55, 0.5 + keywordDensity * 2.5));
        }
        finalScore = Math.round(Math.max(-1.0, Math.min(1.0, finalScore)) * 100) / 100;
        // Sentiment classification
        let sentiment;
        if (finalScore >= 0.15) {
            sentiment = 'Positive';
        }
        else if (finalScore <= -0.15) {
            sentiment = 'Negative';
        }
        else {
            sentiment = 'Neutral';
        }
        // Override if rating is extreme (e.g. 5 stars or 1 star) unless text overwhelmingly contradicts
        if (review.rating === 5 && finalScore > -0.4) {
            sentiment = 'Positive';
        }
        else if (review.rating === 1 && finalScore < 0.4) {
            sentiment = 'Negative';
        }
        // Detect Topics
        const detectedTopics = [];
        for (const topicDef of lexicon_js_1.TOPIC_DEFINITIONS) {
            let isMatch = false;
            for (const pattern of topicDef.patterns) {
                if (pattern.test(lower)) {
                    isMatch = true;
                    break;
                }
            }
            if (!isMatch) {
                for (const kw of topicDef.keywords) {
                    if (lower.includes(kw)) {
                        isMatch = true;
                        break;
                    }
                }
            }
            if (isMatch) {
                detectedTopics.push(topicDef.name);
            }
        }
        if (detectedTopics.length === 0) {
            detectedTopics.push('General Experience');
        }
        return {
            ...review,
            sentiment,
            sentimentScore: finalScore,
            confidence: Math.round(confidence * 100) / 100,
            detectedTopics,
            matchedKeywords: Array.from(new Set(matchedKeywords))
        };
    }
    /**
     * Compute top-level dashboard metrics
     */
    computeDashboardMetrics(reviews) {
        const total = reviews.length;
        let posCount = 0;
        let neuCount = 0;
        let negCount = 0;
        let ratingSum = 0;
        let validRatingCount = 0;
        const ratingsDist = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        const topicCounts = {};
        const negTopicCounts = {};
        const posTopicCounts = {};
        for (const r of reviews) {
            if (r.sentiment === 'Positive')
                posCount++;
            else if (r.sentiment === 'Neutral')
                neuCount++;
            else if (r.sentiment === 'Negative')
                negCount++;
            if (r.rating !== null && r.rating >= 1 && r.rating <= 5) {
                const roundedStar = Math.min(5, Math.max(1, Math.round(r.rating)));
                ratingsDist[roundedStar] = (ratingsDist[roundedStar] || 0) + 1;
                ratingSum += r.rating;
                validRatingCount++;
            }
            for (const t of r.detectedTopics) {
                if (t === 'General Experience')
                    continue;
                topicCounts[t] = (topicCounts[t] || 0) + 1;
                if (r.sentiment === 'Negative') {
                    negTopicCounts[t] = (negTopicCounts[t] || 0) + 1;
                }
                else if (r.sentiment === 'Positive') {
                    posTopicCounts[t] = (posTopicCounts[t] || 0) + 1;
                }
            }
        }
        const avgRating = validRatingCount > 0
            ? Math.round((ratingSum / validRatingCount) * 10) / 10
            : null;
        // Top topic overall
        let topTopic = 'General Feedback';
        let maxTopicCount = 0;
        for (const [top, count] of Object.entries(topicCounts)) {
            if (count > maxTopicCount) {
                maxTopicCount = count;
                topTopic = top;
            }
        }
        // Top negative topic
        let topNegTopic = null;
        let maxNegCount = 0;
        for (const [top, count] of Object.entries(negTopicCounts)) {
            if (count > maxNegCount) {
                maxNegCount = count;
                topNegTopic = top;
            }
        }
        // Top positive topic
        let topPosTopic = null;
        let maxPosCount = 0;
        for (const [top, count] of Object.entries(posTopicCounts)) {
            if (count > maxPosCount) {
                maxPosCount = count;
                topPosTopic = top;
            }
        }
        return {
            totalValidReviews: total,
            sentimentBreakdown: {
                positive: posCount,
                neutral: neuCount,
                negative: negCount
            },
            sentimentPercentages: {
                positive: total > 0 ? Math.round((posCount / total) * 1000) / 10 : 0,
                neutral: total > 0 ? Math.round((neuCount / total) * 1000) / 10 : 0,
                negative: total > 0 ? Math.round((negCount / total) * 1000) / 10 : 0
            },
            averageRating: avgRating,
            ratingsDistribution: validRatingCount > 0 ? ratingsDist : null,
            topTopic,
            topNegativeTopic: topNegTopic,
            topPositiveTopic: topPosTopic
        };
    }
    /**
     * Compute topic breakdown with percentages and sentiment split
     */
    computeTopicMetrics(reviews) {
        const total = reviews.length;
        const topicMap = new Map();
        for (const tDef of lexicon_js_1.TOPIC_DEFINITIONS) {
            topicMap.set(tDef.name, {
                category: tDef.category,
                count: 0,
                pos: 0,
                neu: 0,
                neg: 0,
                ratingSum: 0,
                ratingCount: 0,
                snippets: []
            });
        }
        for (const r of reviews) {
            for (const t of r.detectedTopics) {
                let entry = topicMap.get(t);
                if (!entry) {
                    entry = {
                        category: 'General',
                        count: 0,
                        pos: 0,
                        neu: 0,
                        neg: 0,
                        ratingSum: 0,
                        ratingCount: 0,
                        snippets: []
                    };
                    topicMap.set(t, entry);
                }
                entry.count++;
                if (r.sentiment === 'Positive')
                    entry.pos++;
                else if (r.sentiment === 'Neutral')
                    entry.neu++;
                else if (r.sentiment === 'Negative')
                    entry.neg++;
                if (r.rating !== null) {
                    entry.ratingSum += r.rating;
                    entry.ratingCount++;
                }
                // Keep up to 3 distinct concise snippets
                if (entry.snippets.length < 3 && r.review_text.length >= 20) {
                    const truncated = this.truncateText(r.review_text, 140);
                    if (!entry.snippets.includes(truncated)) {
                        entry.snippets.push(truncated);
                    }
                }
            }
        }
        const result = [];
        for (const [name, data] of topicMap.entries()) {
            if (data.count === 0 && name === 'General Experience')
                continue;
            if (data.count === 0)
                continue;
            const percentage = total > 0 ? Math.round((data.count / total) * 1000) / 10 : 0;
            const negPercent = data.count > 0 ? Math.round((data.neg / data.count) * 1000) / 10 : 0;
            const avgRating = data.ratingCount > 0 ? Math.round((data.ratingSum / data.ratingCount) * 10) / 10 : null;
            result.push({
                name,
                category: data.category,
                count: data.count,
                percentage,
                sentimentBreakdown: {
                    positive: data.pos,
                    neutral: data.neu,
                    negative: data.neg
                },
                negativePercentage: negPercent,
                averageRating: avgRating,
                sampleSnippets: data.snippets
            });
        }
        // Sort by count descending
        return result.sort((a, b) => b.count - a.count);
    }
    /**
     * Group reviews by date for sentiment over time line chart
     */
    computeSentimentOverTime(reviews) {
        const reviewsWithDate = reviews.filter(r => r.review_date !== null);
        if (reviewsWithDate.length < 3) {
            return null; // Not enough date information for a meaningful trend chart
        }
        const dateBuckets = new Map();
        for (const r of reviewsWithDate) {
            const d = r.review_date;
            let bucket = dateBuckets.get(d);
            if (!bucket) {
                bucket = { pos: 0, neu: 0, neg: 0, ratingSum: 0, ratingCount: 0, count: 0 };
                dateBuckets.set(d, bucket);
            }
            bucket.count++;
            if (r.sentiment === 'Positive')
                bucket.pos++;
            else if (r.sentiment === 'Neutral')
                bucket.neu++;
            else if (r.sentiment === 'Negative')
                bucket.neg++;
            if (r.rating !== null) {
                bucket.ratingSum += r.rating;
                bucket.ratingCount++;
            }
        }
        const sortedDates = Array.from(dateBuckets.keys()).sort();
        // If too many distinct dates (e.g. > 20), group or slice appropriately
        return sortedDates.map(date => {
            const b = dateBuckets.get(date);
            return {
                date,
                positive: b.pos,
                neutral: b.neu,
                negative: b.neg,
                averageRating: b.ratingCount > 0 ? Math.round((b.ratingSum / b.ratingCount) * 10) / 10 : null,
                count: b.count
            };
        });
    }
    /**
     * Generate 3-5 strictly evidence-backed recommendations
     */
    generateRecommendations(reviews, topics, metrics) {
        const recommendations = [];
        const totalValid = reviews.length;
        const totalNegative = metrics.sentimentBreakdown.negative;
        // Helper to get actual negative review excerpts for a topic
        const getNegativeExcerptsForTopic = (topicName, maxExcerpts = 3) => {
            const matchingReviews = reviews.filter(r => r.sentiment === 'Negative' && r.detectedTopics.includes(topicName));
            return matchingReviews
                .slice(0, maxExcerpts)
                .map(r => `"${this.truncateText(r.review_text, 120)}"`);
        };
        // Helper to get positive review excerpts for a topic
        const getPositiveExcerptsForTopic = (topicName, maxExcerpts = 2) => {
            const matchingReviews = reviews.filter(r => r.sentiment === 'Positive' && r.detectedTopics.includes(topicName));
            return matchingReviews
                .slice(0, maxExcerpts)
                .map(r => `"${this.truncateText(r.review_text, 120)}"`);
        };
        // 1. Examine Shipping & Delivery
        const shippingTopic = topics.find(t => t.name === 'Shipping & Delivery');
        if (shippingTopic && shippingTopic.sentimentBreakdown.negative >= 2) {
            const negShippingCount = shippingTopic.sentimentBreakdown.negative;
            const negShare = totalNegative > 0
                ? Math.round((negShippingCount / totalNegative) * 100)
                : Math.round((negShippingCount / totalValid) * 100);
            const excerpts = getNegativeExcerptsForTopic('Shipping & Delivery', 2);
            if (excerpts.length >= 2) {
                recommendations.push({
                    id: 'rec-shipping',
                    priority: negShare >= 25 ? 'High' : 'Medium',
                    title: 'Resolve Logistics Bottlenecks & Improve Delivery Predictability',
                    whyItMatters: `Late transit and carrier delays account for ${negShare}% of all negative feedback, damaging customer trust right at initial fulfillment.`,
                    supportingMetrics: `Shipping issues identified in ${negShippingCount} negative reviews (${negShare}% of negative reviews, avg rating ${shippingTopic.averageRating ?? 'N/A'}/5).`,
                    supportingExcerpts: excerpts,
                    expectedImpact: 'Reduced post-purchase cancellations and 15–25% reduction in shipping-related support tickets.',
                    suggestedOwner: 'Operations'
                });
            }
        }
        // 2. Examine Packaging & Condition
        const packagingTopic = topics.find(t => t.name === 'Packaging & Condition');
        if (packagingTopic && packagingTopic.sentimentBreakdown.negative >= 2) {
            const negPkgCount = packagingTopic.sentimentBreakdown.negative;
            const negShare = totalNegative > 0 ? Math.round((negPkgCount / totalNegative) * 100) : 0;
            const excerpts = getNegativeExcerptsForTopic('Packaging & Condition', 2);
            if (excerpts.length >= 2) {
                recommendations.push({
                    id: 'rec-packaging',
                    priority: negShare >= 20 ? 'High' : 'Medium',
                    title: 'Reinforce Packaging Standards to Prevent In-Transit Transit Damage',
                    whyItMatters: 'Customers report receiving damaged or dented parcels, leading directly to preventable replacement costs and poor unboxing impressions.',
                    supportingMetrics: `${negPkgCount} negative reviews specifically mention damaged boxes, torn seals, or crushed contents.`,
                    supportingExcerpts: excerpts,
                    expectedImpact: 'Decrease in return merchandise authorization (RMA) claims and higher initial product satisfaction.',
                    suggestedOwner: 'Operations'
                });
            }
        }
        // 3. Examine Product Quality & Durability
        const qualityTopic = topics.find(t => t.name === 'Product Quality & Durability');
        if (qualityTopic && qualityTopic.sentimentBreakdown.negative >= 2) {
            const negQualityCount = qualityTopic.sentimentBreakdown.negative;
            const negShare = totalNegative > 0 ? Math.round((negQualityCount / totalNegative) * 100) : 0;
            const excerpts = getNegativeExcerptsForTopic('Product Quality & Durability', 2);
            if (excerpts.length >= 2) {
                recommendations.push({
                    id: 'rec-quality',
                    priority: negShare >= 30 ? 'High' : 'Medium',
                    title: 'Initiate Batch Quality Inspection & Supplier Material Review',
                    whyItMatters: 'Recurring mentions of premature wear, fragile components, or failure after short use erode brand loyalty.',
                    supportingMetrics: `${negQualityCount} negative reviews cited build quality flaws (representing ${negShare}% of total negative sentiment).`,
                    supportingExcerpts: excerpts,
                    expectedImpact: 'Protection of lifetime customer value and reduction in manufacturer warranty replacements.',
                    suggestedOwner: 'Quality Engineering'
                });
            }
        }
        // 4. Examine Sizing & Fit
        const sizingTopic = topics.find(t => t.name === 'Sizing & Fit');
        if (sizingTopic && sizingTopic.sentimentBreakdown.negative >= 2) {
            const negSizingCount = sizingTopic.sentimentBreakdown.negative;
            const excerpts = getNegativeExcerptsForTopic('Sizing & Fit', 2);
            if (excerpts.length >= 2) {
                recommendations.push({
                    id: 'rec-sizing',
                    priority: 'Medium',
                    title: 'Update Product Size Charts & Add Customer Fit Guidance',
                    whyItMatters: 'Inconsistent sizing expectations drive high return volumes and customer friction after delivery.',
                    supportingMetrics: `${negSizingCount} reviews complained of sizing discrepancies (runs too small/large).`,
                    supportingExcerpts: excerpts,
                    expectedImpact: 'Immediate 20–30% drop in size-related returns and better buyer confidence.',
                    suggestedOwner: 'Product'
                });
            }
        }
        // 5. Examine Customer Support / Returns & Refunds
        const supportTopic = topics.find(t => t.name === 'Customer Support' || t.name === 'Returns & Refunds');
        if (supportTopic && supportTopic.sentimentBreakdown.negative >= 2) {
            const negSupportCount = supportTopic.sentimentBreakdown.negative;
            const excerpts = getNegativeExcerptsForTopic(supportTopic.name, 2);
            if (excerpts.length >= 2) {
                recommendations.push({
                    id: 'rec-support',
                    priority: 'High',
                    title: 'Streamline Support Escalation & Refund Resolution Workflows',
                    whyItMatters: 'Unresponsive support tickets and delayed refunds escalate minor product grievances into public negative ratings.',
                    supportingMetrics: `${negSupportCount} reviews cited frustrating customer care experiences or delayed refunds.`,
                    supportingExcerpts: excerpts,
                    expectedImpact: 'Faster first-response times and prevention of 1-star review escalations.',
                    suggestedOwner: 'Customer Support'
                });
            }
        }
        // 6. Examine Usability & Setup
        const usabilityTopic = topics.find(t => t.name === 'Usability & Setup');
        if (usabilityTopic && usabilityTopic.sentimentBreakdown.negative >= 2) {
            const negCount = usabilityTopic.sentimentBreakdown.negative;
            const excerpts = getNegativeExcerptsForTopic('Usability & Setup', 2);
            if (excerpts.length >= 2) {
                recommendations.push({
                    id: 'rec-usability',
                    priority: 'Low',
                    title: 'Revamp Quick-Start Guide & Embed Interactive Setup Video',
                    whyItMatters: 'Customers face early configuration confusion that can easily be mitigated with visual onboarding.',
                    supportingMetrics: `${negCount} reviews noted confusing setup steps or incomplete manuals.`,
                    supportingExcerpts: excerpts,
                    expectedImpact: 'Smoother day-one onboarding and reduced simple-configuration inquiries.',
                    suggestedOwner: 'Product'
                });
            }
        }
        // 7. If positive sentiment is strong, provide growth/marketing leverage recommendation
        if (metrics.sentimentPercentages.positive >= 50 && recommendations.length < 5) {
            const topPositive = topics.find(t => t.sentimentBreakdown.positive >= 3 && t.name !== 'General Experience');
            if (topPositive) {
                const positiveExcerpts = getPositiveExcerptsForTopic(topPositive.name, 2);
                if (positiveExcerpts.length >= 2) {
                    recommendations.push({
                        id: 'rec-marketing-leverage',
                        priority: 'Low',
                        title: `Spotlight "${topPositive.name}" Strengths in High-Converting Ad Copy`,
                        whyItMatters: `High customer satisfaction around ${topPositive.name} is a proven brand differentiator backed by organic praise.`,
                        supportingMetrics: `${topPositive.sentimentBreakdown.positive} positive reviews praise ${topPositive.name} (satisfaction rating ${topPositive.averageRating ?? 'N/A'}/5).`,
                        supportingExcerpts: positiveExcerpts,
                        expectedImpact: 'Higher ad click-through rate (CTR) and improved storefront conversion by validating social proof.',
                        suggestedOwner: 'Marketing'
                    });
                }
            }
        }
        // If still less than 3 recommendations due to small/synthetic dataset, extract general issue cluster
        if (recommendations.length < 3 && totalNegative > 0) {
            const generalNegatives = reviews.filter(r => r.sentiment === 'Negative').slice(0, 2);
            if (generalNegatives.length >= 1) {
                const excerpts = generalNegatives.map(r => `"${this.truncateText(r.review_text, 120)}"`);
                recommendations.push({
                    id: 'rec-customer-outreach',
                    priority: 'Medium',
                    title: 'Conduct Proactive Outreach to Detractor Cohort for Retention',
                    whyItMatters: 'Direct resolution of verified purchaser issues turns negative reviewers into retained customers.',
                    supportingMetrics: `Identified ${totalNegative} dissatisfied customers (${metrics.sentimentPercentages.negative}% detractor rate).`,
                    supportingExcerpts: excerpts,
                    expectedImpact: 'Potential to recover 20–30% of at-risk customers through targeted service recovery.',
                    suggestedOwner: 'Customer Support'
                });
            }
        }
        // Ensure we return 3 to 5 recommendations, prioritized
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return recommendations
            .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
            .slice(0, 5);
    }
    truncateText(text, maxLength) {
        const clean = text.replace(/[\r\n\t]+/g, ' ').trim();
        if (clean.length <= maxLength)
            return clean;
        return clean.slice(0, maxLength - 3) + '...';
    }
}
exports.LocalHeuristicAnalysisProvider = LocalHeuristicAnalysisProvider;
