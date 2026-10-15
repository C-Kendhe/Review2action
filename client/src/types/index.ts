export type SentimentType = 'Positive' | 'Neutral' | 'Negative';

export interface NormalizedReview {
  review_id: string;
  review_text: string;
  rating: number | null;
  product_name: string | null;
  review_date: string | null;
  review_title: string | null;
}

export interface AnalyzedReview extends NormalizedReview {
  sentiment: SentimentType;
  sentimentScore: number;
  confidence: number;
  detectedTopics: string[];
  matchedKeywords: string[];
  highlightSnippets?: string[];
}

export interface CleaningSummary {
  totalUploaded: number;
  validReviews: number;
  removedBlank: number;
  removedDuplicates: number;
  malformedSkipped: number;
  hasRatingsCount: number;
  hasDatesCount: number;
  hasProductsCount: number;
  detectedHeaders: string[];
  mappedHeaders: Record<string, string>;
  sampleCleanedPreview: NormalizedReview[];
}

export interface SentimentOverTimePoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  averageRating: number | null;
  count: number;
}

export interface TopicMetric {
  name: string;
  category: string;
  count: number;
  percentage: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  negativePercentage: number;
  averageRating: number | null;
  sampleSnippets: string[];
}

export interface Recommendation {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  whyItMatters: string;
  supportingMetrics: string;
  supportingExcerpts: string[];
  expectedImpact: string;
  suggestedOwner: 'Operations' | 'Product' | 'Customer Support' | 'Marketing' | 'Quality Engineering';
}

export interface DashboardMetrics {
  totalValidReviews: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sentimentPercentages: {
    positive: number;
    neutral: number;
    negative: number;
  };
  averageRating: number | null;
  ratingsDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  } | null;
  topTopic: string;
  topNegativeTopic: string | null;
  topPositiveTopic: string | null;
}

export interface ProviderInfo {
  providerName: string;
  model: string;
  isFallbackOrLocal: boolean;
  disclaimer: string;
  amdIntegrationReady: boolean;
}

export interface AnalysisResult {
  cleaningSummary: CleaningSummary;
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type PageTab = 'dashboard' | 'upload' | 'insights' | 'recommendations' | 'smartstock' | 'about';

export * from './smartStock.js';

