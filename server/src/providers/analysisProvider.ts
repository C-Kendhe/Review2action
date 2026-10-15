import {
  NormalizedReview,
  AnalyzedReview,
  DashboardMetrics,
  SentimentOverTimePoint,
  TopicMetric,
  Recommendation,
  ProviderInfo
} from '../types/index.js';

export interface AnalysisOutput {
  metrics: DashboardMetrics;
  sentiment: {
    averageScore: number;
    sentimentOverTime: SentimentOverTimePoint[] | null;
  };
  topics: TopicMetric[];
  recommendations: Recommendation[];
  reviews: AnalyzedReview[];
  providerInfo: ProviderInfo;
}

export interface AnalysisProvider {
  readonly name: string;
  analyze(reviews: NormalizedReview[]): Promise<AnalysisOutput>;
}
