"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmdLlmAnalysisProvider = void 0;
const localHeuristicProvider_js_1 = require("./localHeuristicProvider.js");
const VALID_PRIORITIES = new Set(['High', 'Medium', 'Low']);
const VALID_OWNERS = new Set([
    'Operations',
    'Product',
    'Customer Support',
    'Marketing',
    'Quality Engineering'
]);
/**
 * Adapter for AMD Token Factory OpenAI-compatible LLM inference.
 *
 * Supported Backend Environments:
 * - AMD Token Factory OpenAI-compatible API serving models such as
 *   Qwen3.8-Flash-Next on AMD Instinct ROCm architecture.
 *
 * Environment Variables:
 * - AMD_LLM_ENDPOINT: e.g. "https://developer.amd.com.cn/radeon/api/v1/chat/completions"
 * - AMD_LLM_MODEL: e.g. "Qwen3.8-Flash-Next"
 * - AMD_LLM_API_KEY: Secure token passed only on server side
 */
class AmdLlmAnalysisProvider {
    name = 'AmdLlmAnalysisProvider';
    fallbackProvider = new localHeuristicProvider_js_1.LocalHeuristicAnalysisProvider();
    async analyze(reviews) {
        const rawEndpoint = process.env.AMD_LLM_ENDPOINT?.trim();
        const model = process.env.AMD_LLM_MODEL?.trim() || 'Qwen3.8-Flash-Next';
        const apiKey = process.env.AMD_LLM_API_KEY?.trim();
        // 1. Calculate deterministic baseline metrics locally first
        // This provides exact mathematics, sentiment over time, star distribution,
        // and full review-level classifications with zero hallucination and zero token waste.
        const baseAnalysis = await this.fallbackProvider.analyze(reviews);
        // If AMD endpoint is not configured in this environment, return local analysis
        if (!rawEndpoint) {
            console.info('[AmdLlmAnalysisProvider] AMD_LLM_ENDPOINT not configured. Operating in pluggable local mode.');
            return {
                ...baseAnalysis,
                providerInfo: {
                    providerName: 'AMD Token Factory (Local Fallback Active)',
                    model: `${model} (Ready for endpoint binding)`,
                    isFallbackOrLocal: true,
                    disclaimer: 'Operating in local heuristic mode. Set AMD_LLM_ENDPOINT and AMD_LLM_API_KEY in server environment to enable AMD Token Factory GPU-accelerated LLM reasoning.',
                    amdIntegrationReady: true
                }
            };
        }
        // Normalize OpenAI-compatible endpoint URL
        const endpoint = rawEndpoint.endsWith('/chat/completions')
            ? rawEndpoint
            : `${rawEndpoint.replace(/\/+$/, '')}/chat/completions`;
        const sanitizedEndpoint = rawEndpoint.split('?')[0];
        let errorCategory = 'Inference error';
        const startTime = Date.now();
        console.info(`[ReviewAnalysis-AMD] Starting inference request to ${sanitizedEndpoint} for ${reviews.length} reviews (model: ${model})...`);
        try {
            // 2. Build concise, information-dense prompt for AMD Token Factory
            // Focusing the LLM on strategic synthesis avoids asking the model to regenerate
            // review text or compute arithmetic that is already calculated locally.
            const prompt = this.buildRecommendationsPrompt(baseAnalysis, reviews);
            // 120s timeout to allow large models on AMD cloud inference to complete reliably
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000);
            const headers = {
                'Content-Type': 'application/json'
            };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
            let response;
            try {
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers,
                    signal: controller.signal,
                    body: JSON.stringify({
                        model,
                        reasoning_effort: 'low', // avoids model default xhigh reasoning effort
                        temperature: 0.1, // low temperature for grounded executive insights
                        max_tokens: 2500, // compact token budget for 3-5 recommendations with low reasoning
                        response_format: { type: 'json_object' },
                        messages: [
                            {
                                role: 'user',
                                content: prompt
                            }
                        ]
                    })
                });
            }
            finally {
                clearTimeout(timeoutId);
            }
            const elapsedMs = Date.now() - startTime;
            // Check HTTP response status
            if (!response.ok) {
                errorCategory = `HTTP ${response.status} (${response.statusText || 'Error'})`;
                throw new Error(`AMD Token Factory endpoint responded with HTTP ${response.status}: ${response.statusText}`);
            }
            let rawJson;
            try {
                rawJson = await response.json();
            }
            catch (jsonErr) {
                errorCategory = 'Malformed HTTP response JSON';
                throw new Error(`Failed to parse HTTP response as JSON from AMD inference server: ${jsonErr.message}`);
            }
            const choice = rawJson?.choices?.[0];
            const content = choice?.message?.content;
            if (!content || typeof content !== 'string' || content.trim().length === 0) {
                if (choice?.finish_reason === 'length') {
                    errorCategory = 'Max tokens exceeded before content completion';
                    throw new Error('AMD inference reached token limit during reasoning before completing output JSON.');
                }
                errorCategory = 'Empty payload';
                throw new Error('Empty or invalid choices payload from AMD Token Factory inference server.');
            }
            // Strip optional markdown code fences if returned by model
            const cleanedContent = content
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
            let parsedData;
            try {
                parsedData = JSON.parse(cleanedContent);
            }
            catch (parseErr) {
                errorCategory = 'Malformed model JSON';
                throw new Error(`Failed to parse model output content as JSON: ${parseErr.message}`);
            }
            // Validate schema for recommendations
            const validatedRecs = this.validateAndNormalizeRecommendations(parsedData?.recommendations);
            if (!validatedRecs || validatedRecs.length === 0) {
                errorCategory = 'Schema validation failure';
                throw new Error('AMD model returned an empty or invalid recommendations array schema.');
            }
            // SUCCESS: Only claim AMD inference succeeded when actual API response succeeds and validates
            console.info(`[ReviewAnalysis-AMD] Inference succeeded in ${elapsedMs}ms (${(elapsedMs / 1000).toFixed(1)}s) via ${sanitizedEndpoint} with ${validatedRecs.length} recommendations.`);
            return {
                metrics: baseAnalysis.metrics,
                sentiment: baseAnalysis.sentiment,
                topics: baseAnalysis.topics,
                recommendations: validatedRecs,
                reviews: baseAnalysis.reviews,
                providerInfo: {
                    providerName: 'AMD Token Factory (ROCm Instinct Acceleration)',
                    model: `${model} (AMD ROCm Compute)`,
                    isFallbackOrLocal: false,
                    disclaimer: 'Analysis generated using AMD Token Factory Qwen3.8-Flash-Next on AMD Instinct ROCm compute.',
                    amdIntegrationReady: true
                }
            };
        }
        catch (err) {
            const elapsedMs = Date.now() - startTime;
            // Categorize and log error without leaking secrets or credentials
            if (err?.name === 'AbortError' || err?.message?.toLowerCase().includes('abort')) {
                errorCategory = 'Timeout (exceeded 120s)';
                console.warn(`[ReviewAnalysis-AMD] Inference call to ${sanitizedEndpoint} timed out after ${elapsedMs}ms (${(elapsedMs / 1000).toFixed(1)}s). Falling back to local heuristic provider.`);
            }
            else {
                console.warn(`[ReviewAnalysis-AMD] Inference call to ${sanitizedEndpoint} failed [${errorCategory}] after ${elapsedMs}ms: ${err.message}. Falling back to local heuristic provider.`);
            }
            // Gracefully fall back to local heuristic recommendations
            return {
                ...baseAnalysis,
                providerInfo: {
                    providerName: 'AMD Token Factory (Failover to Local)',
                    model: `${model} (Local Fallback Active)`,
                    isFallbackOrLocal: true,
                    disclaimer: `External AMD Token Factory inference unavailable (${errorCategory}). Gracefully fell back to deterministic local heuristics.`,
                    amdIntegrationReady: true
                }
            };
        }
    }
    /**
     * Constructs an information-dense prompt for executive recommendation generation.
     * Feeds pre-calculated metrics, top topic frequencies, and real customer excerpts.
     */
    buildRecommendationsPrompt(baseAnalysis, reviews) {
        const { metrics } = baseAnalysis;
        // Extract real customer pain points from negative reviews
        const painPoints = reviews
            .filter(r => r.rating !== null && r.rating <= 2)
            .slice(0, 3)
            .map(r => `[Rating: ${r.rating}★] "${this.truncate(r.review_text, 100)}"`)
            .join('\n');
        return `Based on these ${metrics.totalValidReviews} customer reviews (${metrics.sentimentPercentages.negative}% negative, top issue: ${metrics.topNegativeTopic ?? 'General Feedback'}), generate exactly 3 strategic recommendations in valid JSON.

CUSTOMER PAIN POINTS:
${painPoints || 'No severe complaints'}

JSON SCHEMA:
{
  "recommendations": [
    {
      "id": "rec-1",
      "priority": "High",
      "title": "Action title",
      "whyItMatters": "Reason",
      "supportingMetrics": "Metrics",
      "supportingExcerpts": ["Quote"],
      "expectedImpact": "Impact",
      "suggestedOwner": "Operations"
    }
  ]
}`;
    }
    /**
     * Validates and normalizes recommendation items from LLM JSON output.
     */
    validateAndNormalizeRecommendations(rawList) {
        if (!Array.isArray(rawList) || rawList.length === 0) {
            return null;
        }
        const validated = [];
        for (let i = 0; i < rawList.length; i++) {
            const item = rawList[i];
            if (!item || typeof item !== 'object')
                continue;
            const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : null;
            const whyItMatters = typeof item.whyItMatters === 'string' && item.whyItMatters.trim() ? item.whyItMatters.trim() : null;
            if (!title || !whyItMatters)
                continue;
            const priorityRaw = String(item.priority || 'Medium').trim();
            const priority = (VALID_PRIORITIES.has(priorityRaw) ? priorityRaw : 'Medium');
            const ownerRaw = String(item.suggestedOwner || 'Operations').trim();
            const suggestedOwner = (VALID_OWNERS.has(ownerRaw) ? ownerRaw : 'Operations');
            const supportingMetrics = typeof item.supportingMetrics === 'string' && item.supportingMetrics.trim()
                ? item.supportingMetrics.trim()
                : 'Identified through customer sentiment patterns.';
            const expectedImpact = typeof item.expectedImpact === 'string' && item.expectedImpact.trim()
                ? item.expectedImpact.trim()
                : 'Improved customer retention and satisfaction.';
            const supportingExcerpts = Array.isArray(item.supportingExcerpts)
                ? item.supportingExcerpts
                    .filter((e) => typeof e === 'string' && e.trim().length > 0)
                    .map((e) => e.trim())
                    .slice(0, 3)
                : [];
            validated.push({
                id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `rec-amd-${i + 1}`,
                priority,
                title,
                whyItMatters,
                supportingMetrics,
                supportingExcerpts,
                expectedImpact,
                suggestedOwner
            });
        }
        return validated.length > 0 ? validated : null;
    }
    truncate(text, maxLen) {
        const clean = text.replace(/[\r\n\t]+/g, ' ').trim();
        if (clean.length <= maxLen)
            return clean;
        return clean.slice(0, maxLen - 3) + '...';
    }
}
exports.AmdLlmAnalysisProvider = AmdLlmAnalysisProvider;
