import React, { useState, useMemo } from 'react';
import {
  Lightbulb,
  Quote,
  Target,
  Users,
  Copy,
  Check,
  Filter,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import type { AnalysisResult, PageTab } from '../types';
import { EmptyState } from '../components/EmptyState';

interface RecommendationsPageProps {
  analysisResult: AnalysisResult | null;
  setCurrentTab: (tab: PageTab) => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  analysisResult,
  setCurrentTab,
  onLoadSample,
  isLoading
}) => {
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedOwner, setSelectedOwner] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  const allRecs = analysisResult?.recommendations;

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    if (!allRecs) return [];
    return allRecs.filter((r) => {
      if (selectedPriority !== 'All' && r.priority !== selectedPriority) return false;
      if (selectedOwner !== 'All' && r.suggestedOwner !== selectedOwner) return false;
      return true;
    });
  }, [allRecs, selectedPriority, selectedOwner]);

  // Unique owners
  const owners = useMemo(() => {
    if (!allRecs) return [];
    const set = new Set<string>();
    allRecs.forEach((r) => set.add(r.suggestedOwner));
    return Array.from(set);
  }, [allRecs]);

  if (!analysisResult) {
    return (
      <EmptyState
        title="No Recommendations Available"
        description="Upload your reviews or load sample data to generate evidence-backed recommendations prioritized by customer impact."
        onUploadClick={() => setCurrentTab('upload')}
        onSampleClick={onLoadSample}
        isLoading={isLoading}
      />
    );
  }

  const { recommendations, metrics } = analysisResult;

  // Copy Markdown Report
  const handleCopyMarkdown = () => {
    let md = `# Review2Action AI — Executive Action Plan\n\n`;
    md += `**Analyzed Dataset**: ${metrics.totalValidReviews} valid reviews\n`;
    md += `**Sentiment Split**: ${metrics.sentimentPercentages.positive}% Positive | ${metrics.sentimentPercentages.neutral}% Neutral | ${metrics.sentimentPercentages.negative}% Negative\n`;
    md += `**Average Rating**: ${metrics.averageRating !== null ? `${metrics.averageRating}/5` : 'N/A'}\n\n`;
    md += `## Prioritized Recommendations\n\n`;

    recommendations.forEach((rec, idx) => {
      md += `### ${idx + 1}. [${rec.priority} Priority] ${rec.title}\n`;
      md += `- **Suggested Owner**: ${rec.suggestedOwner}\n`;
      md += `- **Why It Matters**: ${rec.whyItMatters}\n`;
      md += `- **Supporting Metric**: ${rec.supportingMetrics}\n`;
      md += `- **Expected Impact**: ${rec.expectedImpact}\n`;
      md += `- **Supporting Excerpts**:\n`;
      rec.supportingExcerpts.forEach((ex) => {
        md += `  > ${ex}\n`;
      });
      md += `\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-[#ED1C24] border border-rose-200/80 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Evidence Guarantee • No Hallucinations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Evidence-Backed Business Actions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {recommendations.length} prioritized recommendations synthesized from customer review patterns and pain points
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Export Report (Markdown)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {/* Priority filter */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200/60">
            {['All', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  selectedPriority === p
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Owner filter */}
          {owners.length > 1 && (
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All Teams ({owners.length})</option>
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-slate-400 text-[11px]">
          Showing {filteredRecs.length} of {recommendations.length} recommendations
        </div>
      </div>

      {/* Recommendations Cards Stack */}
      <div className="space-y-6">
        {filteredRecs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
            <Lightbulb className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No recommendations match your active filter</p>
            <p className="text-xs text-slate-400 mt-1">Try switching to "All" priorities or teams.</p>
          </div>
        ) : (
          filteredRecs.map((rec, index) => {
            const isHigh = rec.priority === 'High';
            const isMedium = rec.priority === 'Medium';

            return (
              <article
                key={rec.id || index}
                className={`bg-white rounded-3xl border transition-shadow hover:shadow-md overflow-hidden ${
                  isHigh
                    ? 'border-rose-200 shadow-xs'
                    : isMedium
                    ? 'border-amber-200 shadow-xs'
                    : 'border-slate-200/90 shadow-xs'
                }`}
              >
                {/* Top Banner with Priority & Owner */}
                <div
                  className={`px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b ${
                    isHigh
                      ? 'bg-rose-50/70 border-rose-100'
                      : isMedium
                      ? 'bg-amber-50/70 border-amber-100'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        isHigh
                          ? 'bg-[#ED1C24] text-white'
                          : isMedium
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>

                    <span className="text-xs font-bold text-slate-700">
                      Recommendation #{index + 1}
                    </span>
                  </div>

                  {/* Owner Team Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Owner: <strong>{rec.suggestedOwner}</strong></span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Action Title */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                      {rec.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {rec.whyItMatters}
                    </p>
                  </div>

                  {/* Supporting Metric Callout */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <Target className="w-5 h-5 text-[#ED1C24] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Supporting Evidence & Metrics
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">
                        {rec.supportingMetrics}
                      </p>
                    </div>
                  </div>

                  {/* Verbatim Supporting Excerpts */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-slate-400" />
                      Verbatim Customer Quotes ({rec.supportingExcerpts.length})
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rec.supportingExcerpts.map((excerpt, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs italic text-slate-700 leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-slate-400 font-serif text-lg leading-none">“</span>
                          <span className="flex-1">
                            {excerpt.replace(/^"|"$/g, '')}
                          </span>
                          <span className="text-slate-400 font-serif text-lg leading-none">”</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expected Business Impact */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Expected Impact:</strong> {rec.expectedImpact}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Grounded in verified uploaded reviews
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Bottom CTA to Explore Reviews */}
      <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Want to inspect individual customer comments?</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Use the Review Explorer to filter reviews by sentiment, topic keywords, and 1-star ratings.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('insights')}
          className="px-4 py-2 text-xs font-bold bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-xl transition shadow-2xs shrink-0 cursor-pointer"
        >
          Open Review Explorer
        </button>
      </div>
    </div>
  );
};
