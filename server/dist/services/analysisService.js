"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisService = exports.AnalysisService = void 0;
const localHeuristicProvider_js_1 = require("../providers/localHeuristicProvider.js");
const amdLlmProvider_js_1 = require("../providers/amdLlmProvider.js");
class AnalysisService {
    provider;
    inMemoryCache = new Map();
    constructor() {
        // Select provider based on environment configuration
        const useAmdLlm = process.env.USE_AMD_LLM === 'true' || Boolean(process.env.AMD_LLM_ENDPOINT);
        if (useAmdLlm) {
            this.provider = new amdLlmProvider_js_1.AmdLlmAnalysisProvider();
        }
        else {
            this.provider = new localHeuristicProvider_js_1.LocalHeuristicAnalysisProvider();
        }
    }
    getActiveProviderName() {
        return this.provider.name;
    }
    /**
     * Run the full analysis on cleaned reviews
     */
    async analyzeReviews(reviews, cleaningSummary) {
        if (reviews.length === 0) {
            throw new Error('NO_VALID_REVIEWS: The file did not contain any valid reviews to analyze.');
        }
        const output = await this.provider.analyze(reviews);
        const result = {
            cleaningSummary,
            ...output
        };
        // Store in-memory with session key
        const sessionId = `analysis-${Date.now()}`;
        this.inMemoryCache.set(sessionId, result);
        // Keep cache bounded
        if (this.inMemoryCache.size > 20) {
            const oldestKey = this.inMemoryCache.keys().next().value;
            if (oldestKey)
                this.inMemoryCache.delete(oldestKey);
        }
        return result;
    }
    getCachedAnalysis(id) {
        return this.inMemoryCache.get(id);
    }
}
exports.AnalysisService = AnalysisService;
exports.analysisService = new AnalysisService();
