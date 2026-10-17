import { NormalizedReview, CleaningSummary, AnalysisResult } from '../types/index.js';
import { AnalysisProvider } from '../providers/analysisProvider.js';
import { LocalHeuristicAnalysisProvider } from '../providers/localHeuristicProvider.js';
import { AmdLlmAnalysisProvider } from '../providers/amdLlmProvider.js';

export class AnalysisService {
  private amdProvider = new AmdLlmAnalysisProvider();
  private localProvider = new LocalHeuristicAnalysisProvider();
  private inMemoryCache: Map<string, AnalysisResult> = new Map();

  private get provider(): AnalysisProvider {
    // Select AmdLlmAnalysisProvider strictly when USE_AMD_LLM=true, otherwise select LocalHeuristicAnalysisProvider
    return process.env.USE_AMD_LLM === 'true'
      ? this.amdProvider
      : this.localProvider;
  }

  public getActiveProviderName(): string {
    return this.provider.name;
  }

  /**
   * Run the full analysis on cleaned reviews
   */
  public async analyzeReviews(
    reviews: NormalizedReview[],
    cleaningSummary: CleaningSummary
  ): Promise<AnalysisResult> {
    if (reviews.length === 0) {
      throw new Error('NO_VALID_REVIEWS: The file did not contain any valid reviews to analyze.');
    }

    const output = await this.provider.analyze(reviews);

    const result: AnalysisResult = {
      cleaningSummary,
      ...output
    };

    // Store in-memory with session key
    const sessionId = `analysis-${Date.now()}`;
    this.inMemoryCache.set(sessionId, result);

    // Keep cache bounded
    if (this.inMemoryCache.size > 20) {
      const oldestKey = this.inMemoryCache.keys().next().value;
      if (oldestKey) this.inMemoryCache.delete(oldestKey);
    }

    return result;
  }

  public getCachedAnalysis(id: string): AnalysisResult | undefined {
    return this.inMemoryCache.get(id);
  }
}

export const analysisService = new AnalysisService();
