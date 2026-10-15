import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import {
  SmilePlus,
  Frown,
  Star,
  Calendar,
  AlertCircle,
  TrendingDown,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import type { AnalysisResult, PageTab } from '../types';
import { KpiCard } from '../components/KpiCard';
import { ReviewTable } from '../components/ReviewTable';
import { EmptyState } from '../components/EmptyState';

interface InsightsPageProps {
  analysisResult: AnalysisResult | null;
  setCurrentTab: (tab: PageTab) => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

const SENTIMENT_COLORS = {
  Positive: '#10b981', // Emerald
  Neutral: '#64748b',  // Slate
  Negative: '#ED1C24'  // AMD Red
};

export const InsightsPage: React.FC<InsightsPageProps> = ({
  analysisResult,
  setCurrentTab,
  onLoadSample,
  isLoading
}) => {
  if (!analysisResult) {
    return (
      <EmptyState
        title="No Insights Available Yet"
        description="Upload a CSV of customer reviews or load our sample dataset to unlock sentiment distributions, topic clustering, and review analytics."
        onUploadClick={() => setCurrentTab('upload')}
        onSampleClick={onLoadSample}
        isLoading={isLoading}
      />
    );
  }

  const { metrics, sentiment, topics, cleaningSummary } = analysisResult;

  // Sentiment donut data
  const sentimentPieData = [
    { name: 'Positive', value: metrics.sentimentBreakdown.positive, color: SENTIMENT_COLORS.Positive },
    { name: 'Neutral', value: metrics.sentimentBreakdown.neutral, color: SENTIMENT_COLORS.Neutral },
    { name: 'Negative', value: metrics.sentimentBreakdown.negative, color: SENTIMENT_COLORS.Negative }
  ].filter(d => d.value > 0);

  // Topics horizontal bar data (top 8 topics)
  const topTopicsData = topics.slice(0, 8).map(t => ({
    name: t.name,
    count: t.count,
    negativeCount: t.sentimentBreakdown.negative,
    positiveCount: t.sentimentBreakdown.positive,
    negativePercentage: t.negativePercentage
  }));

  // Ratings distribution data
  const ratingsData = metrics.ratingsDistribution
    ? [
        { star: '5 Stars', count: metrics.ratingsDistribution[5] || 0, fill: '#10b981' },
        { star: '4 Stars', count: metrics.ratingsDistribution[4] || 0, fill: '#34d399' },
        { star: '3 Stars', count: metrics.ratingsDistribution[3] || 0, fill: '#fbbf24' },
        { star: '2 Stars', count: metrics.ratingsDistribution[2] || 0, fill: '#f87171' },
        { star: '1 Star', count: metrics.ratingsDistribution[1] || 0, fill: '#ED1C24' }
      ]
    : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Local Disclaimer Banner */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Customer Review Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Executive dashboard based on {metrics.totalValidReviews.toLocaleString()} valid reviews
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('recommendations')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ED1C24]" />
              <span>View Recommendations ({analysisResult.recommendations.length})</span>
            </button>
          </div>
        </div>

        {/* Prototype Disclaimer Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-900">Analysis Notice: </span>
            {analysisResult.providerInfo.disclaimer}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Valid Reviews"
          value={metrics.totalValidReviews.toLocaleString()}
          subtext={`${cleaningSummary.removedBlank + cleaningSummary.removedDuplicates} blank/duplicate filtered`}
          icon={Layers}
          badge="Clean Data"
          badgeColor="bg-slate-100 text-slate-700"
        />

        <KpiCard
          title="Sentiment Split"
          value={`${metrics.sentimentPercentages.positive}% Pos`}
          subtext={`${metrics.sentimentPercentages.negative}% Neg • ${metrics.sentimentPercentages.neutral}% Neu`}
          icon={metrics.sentimentPercentages.positive >= metrics.sentimentPercentages.negative ? SmilePlus : Frown}
          badge={metrics.sentimentPercentages.positive >= 50 ? 'Favorable' : 'Action Needed'}
          badgeColor={metrics.sentimentPercentages.positive >= 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}
          accentColor={metrics.sentimentPercentages.positive >= 50 ? 'text-emerald-700' : 'text-slate-900'}
        />

        <KpiCard
          title="Average Rating"
          value={metrics.averageRating !== null ? `${metrics.averageRating} / 5` : 'N/A'}
          subtext={metrics.averageRating !== null ? `${cleaningSummary.hasRatingsCount} reviews included rating` : 'No rating column provided'}
          icon={Star}
          badge={metrics.averageRating && metrics.averageRating >= 4 ? 'High' : 'Needs Review'}
          badgeColor="bg-amber-50 text-amber-800 border border-amber-200"
          accentColor="text-amber-600"
        />

        <KpiCard
          title="Primary Friction Topic"
          value={metrics.topNegativeTopic || metrics.topTopic}
          subtext={metrics.topNegativeTopic ? `Appears in largest % of critical reviews` : `Most frequent overall theme`}
          icon={TrendingDown}
          badge="Top Issue"
          badgeColor="bg-rose-100 text-[#ED1C24] font-bold"
          accentColor="text-rose-600 truncate max-w-[200px]"
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sentiment Distribution Donut */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Sentiment Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Categorized by keyword polarity and star rating
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Avg Score: {sentiment.averageScore > 0 ? `+${sentiment.averageScore}` : sentiment.averageScore}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: any) => [`${val} reviews`, 'Count']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value: string) => (
                    <span className="text-xs font-semibold text-slate-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Positive</span>
              <span className="font-extrabold text-emerald-600">{metrics.sentimentBreakdown.positive} ({metrics.sentimentPercentages.positive}%)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Neutral</span>
              <span className="font-extrabold text-slate-600">{metrics.sentimentBreakdown.neutral} ({metrics.sentimentPercentages.neutral}%)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Negative</span>
              <span className="font-extrabold text-[#ED1C24]">{metrics.sentimentBreakdown.negative} ({metrics.sentimentPercentages.negative}%)</span>
            </div>
          </div>
        </div>

        {/* Topic Frequency Horizontal Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Top Issues & Topic Frequency
              </h3>
              <p className="text-xs text-slate-500">
                Number of reviews mentioning each predefined category
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {topics.length} total categories
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topTopicsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#334155' }}
                  width={130}
                />
                <RechartsTooltip
                  formatter={(val: any, name: any) => [
                    `${val} mentions`,
                    name === 'count' ? 'Total Mentions' : 'Negative Mentions'
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#0f172a" radius={[0, 6, 6, 0]}>
                  {topTopicsData.map((entry, index) => (
                    <Cell
                      key={`topic-cell-${index}`}
                      fill={entry.negativePercentage >= 40 ? '#ED1C24' : '#1e293b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ED1C24]" />
              Red highlights indicate high negative concentration (≥40% negative)
            </span>
            <span>Sorted by total volume</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Rating Distribution & Sentiment Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rating Distribution (if available) */}
        {ratingsData ? (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Rating Distribution
              </h3>
              <p className="text-xs text-slate-500">
                1-Star to 5-Star customer breakdown
              </p>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingsData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="star" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip
                    formatter={(val: any) => [`${val} reviews`, 'Count']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {ratingsData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-center text-center">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Rating Column in CSV</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Add a numeric <code className="bg-slate-100 px-1 py-0.5 rounded">rating</code> column (1–5) to visualize star score breakdowns.
            </p>
          </div>
        )}

        {/* Sentiment Over Time Line Chart (if dates exist) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Sentiment Trends Over Time
              </h3>
              <p className="text-xs text-slate-500">
                Daily volume tracking for positive vs negative customer feedback
              </p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          {sentiment.sentimentOverTime && sentiment.sentimentOverTime.length >= 3 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={sentiment.sentimentOverTime}
                  margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px'
                    }}
                  />
                  <Legend verticalAlign="top" height={30} iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="positive"
                    name="Positive"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    name="Negative"
                    stroke="#ED1C24"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">Timeline Data Unavailable</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                A minimum of 3 reviews with valid dates (<code className="bg-slate-100 px-1 py-0.5 rounded">review_date</code>) is required to render the time-series trendline.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Explorer Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Detailed Review Explorer
          </h2>
          <span className="text-xs text-slate-500">
            Interactive filtering by sentiment, topic, rating, and keywords
          </span>
        </div>

        <ReviewTable reviews={analysisResult.reviews} />
      </section>
    </div>
  );
};
