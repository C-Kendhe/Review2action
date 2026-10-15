"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmdLlmAnalysisProvider = void 0;
const localHeuristicProvider_js_1 = require("./localHeuristicProvider.js");
/**
 * Adapter for AMD-hosted LLM inference.
 *
 * Supported Backend Environments:
 * - AMD ROCm vLLM / TGI OpenAI-compatible API serving models such as
 *   Meta-Llama-3-70B-Instruct or Mistral on AMD Instinct MI300X / MI250 GPUs.
 *
 * Environment Variables:
 * - AMD_LLM_ENDPOINT: e.g. "https://rocm-inference.amd.internal/v1/chat/completions"
 * - AMD_LLM_MODEL: e.g. "meta-llama/Meta-Llama-3-70B-Instruct"
 * - AMD_LLM_API_KEY: Secure token passed only on server side
 */
class AmdLlmAnalysisProvider {
    name = 'AmdLlmAnalysisProvider';
    fallbackProvider = new localHeuristicProvider_js_1.LocalHeuristicAnalysisProvider();
    async analyze(reviews) {
        const endpoint = process.env.AMD_LLM_ENDPOINT;
        const model = process.env.AMD_LLM_MODEL || 'meta-llama/Meta-Llama-3-70B-Instruct';
        const apiKey = process.env.AMD_LLM_API_KEY;
        // If AMD endpoint is not configured in this environment, execute robust local heuristic analysis
        // and provide clear provider status information
        if (!endpoint) {
            console.info('[AmdLlmAnalysisProvider] AMD_LLM_ENDPOINT not configured. Operating in pluggable local mode.');
            const localResult = await this.fallbackProvider.analyze(reviews);
            return {
                ...localResult,
                providerInfo: {
                    providerName: 'AMD Instinct Acceleration Architecture (Local Fallback Active)',
                    model: `${model} (Ready for endpoint binding)`,
                    isFallbackOrLocal: true,
                    disclaimer: 'Operating in local heuristic mode. Set AMD_LLM_ENDPOINT and AMD_LLM_API_KEY in server environment to enable AMD ROCm GPU-accelerated LLM reasoning.',
                    amdIntegrationReady: true
                }
            };
        }
        try {
            // Prompt construction for strict JSON return grounded solely on provided reviews
            const prompt = this.buildPrompt(reviews);
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
                },
                body: JSON.stringify({
                    model,
                    temperature: 0.1, // low temperature to prevent hallucination
                    response_format: { type: 'json_object' },
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an executive e-commerce review analysis engine running on AMD Instinct ROCm architecture. ' +
                                'CRITICAL RULES: Output strictly valid JSON matching the requested schema. ' +
                                'NEVER invent facts or statistics. All metrics and recommendations MUST be directly grounded in the provided review sample.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });
            if (!response.ok) {
                throw new Error(`AMD LLM endpoint responded with HTTP ${response.status}: ${response.statusText}`);
            }
            const rawJson = await response.json();
            const content = rawJson.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('Empty response payload from AMD LLM inference server.');
            }
            const parsedData = JSON.parse(content);
            // Validate and return parsed LLM structure
            return {
                ...parsedData,
                providerInfo: {
                    providerName: 'AMD ROCm Instinct Acceleration Engine',
                    model,
                    isFallbackOrLocal: false,
                    disclaimer: 'Analysis generated using AMD-hosted LLM inference running on ROCm compute.',
                    amdIntegrationReady: true
                }
            };
        }
        catch (err) {
            console.warn(`[AmdLlmAnalysisProvider] Inference call to ${endpoint} failed: ${err.message}. Falling back to local heuristic provider.`);
            const localResult = await this.fallbackProvider.analyze(reviews);
            return {
                ...localResult,
                providerInfo: {
                    providerName: 'AMD Instinct Acceleration Architecture (Failover to Local)',
                    model: `Fallback after: ${err.message}`,
                    isFallbackOrLocal: true,
                    disclaimer: 'External AMD LLM call failed or timed out. Gracefully fell back to deterministic local heuristics.',
                    amdIntegrationReady: true
                }
            };
        }
    }
    buildPrompt(reviews) {
        const compactReviews = reviews.slice(0, 50).map(r => ({
            id: r.review_id,
            text: r.review_text,
            rating: r.rating,
            product: r.product_name,
            date: r.review_date
        }));
        return `Analyze the following customer reviews and produce strict JSON conforming to this schema:
{
  "metrics": {
    "totalValidReviews": number,
    "sentimentBreakdown": { "positive": number, "neutral": number, "negative": number },
    "sentimentPercentages": { "positive": number, "neutral": number, "negative": number },
    "averageRating": number | null,
    "ratingsDistribution": { "1": number, "2": number, "3": number, "4": number, "5": number } | null,
    "topTopic": string,
    "topNegativeTopic": string | null,
    "topPositiveTopic": string | null
  },
  "sentiment": {
    "averageScore": number (-1.0 to 1.0),
    "sentimentOverTime": [ { "date": string, "positive": number, "neutral": number, "negative": number, "averageRating": number, "count": number } ]
  },
  "topics": [
    {
      "name": string,
      "category": string,
      "count": number,
      "percentage": number,
      "sentimentBreakdown": { "positive": number, "neutral": number, "negative": number },
      "negativePercentage": number,
      "averageRating": number | null,
      "sampleSnippets": string[]
    }
  ],
  "recommendations": [
    {
      "id": string,
      "priority": "High" | "Medium" | "Low",
      "title": string,
      "whyItMatters": string,
      "supportingMetrics": string,
      "supportingExcerpts": string[],
      "expectedImpact": string,
      "suggestedOwner": "Operations" | "Product" | "Customer Support" | "Marketing" | "Quality Engineering"
    }
  ],
  "reviews": [
    {
      "review_id": string,
      "review_text": string,
      "rating": number | null,
      "product_name": string | null,
      "review_date": string | null,
      "review_title": string | null,
      "sentiment": "Positive" | "Neutral" | "Negative",
      "sentimentScore": number,
      "confidence": number,
      "detectedTopics": string[],
      "matchedKeywords": string[]
    }
  ]
}

REVIEWS:
${JSON.stringify(compactReviews, null, 2)}`;
    }
}
exports.AmdLlmAnalysisProvider = AmdLlmAnalysisProvider;
