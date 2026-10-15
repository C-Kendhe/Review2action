import React from 'react';
import {
  Sparkles,
  UploadCloud,
  FileSpreadsheet,
  ArrowRight,
  SmilePlus,
  Compass,
  CheckCircle,
  ShieldCheck,
  Cpu,
  BarChart2
} from 'lucide-react';
import type { AnalysisResult, PageTab } from '../types';

interface DashboardLandingProps {
  analysisResult: AnalysisResult | null;
  setCurrentTab: (tab: PageTab) => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

export const DashboardLanding: React.FC<DashboardLandingProps> = ({
  analysisResult,
  setCurrentTab,
  onLoadSample,
  isLoading
}) => {
  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xs">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-slate-900/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-[#ED1C24] border border-rose-200/80 text-xs font-bold">
            <Cpu className="w-3.5 h-3.5" />
            <span>AMD Hackathon Prototype • E-Commerce Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Turn customer reviews into your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ED1C24] to-rose-600">
              next best action.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            Upload your product reviews CSV. Review2Action AI cleans, segments, and analyzes customer sentiment and topics—then synthesizes evidence-backed business recommendations for product, support, and marketing teams.
          </p>

          {/* Core Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setCurrentTab('upload')}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#ED1C24] group-hover:scale-110 transition-transform" />
              <span>Upload Reviews CSV</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onLoadSample}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{isLoading ? 'Analyzing Sample Dataset...' : 'Explore Sample Dataset'}</span>
            </button>

            {analysisResult && (
              <button
                onClick={() => setCurrentTab('insights')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-rose-50 text-[#ED1C24] border border-rose-200 hover:bg-rose-100/80 transition cursor-pointer"
              >
                <BarChart2 className="w-4 h-4" />
                <span>View Loaded Analytics ({analysisResult.cleaningSummary.validReviews})</span>
              </button>
            )}
          </div>

          {/* Process Mini-Stepper */}
          <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                1
              </span>
              <span className="font-semibold">Upload CSV</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                2
              </span>
              <span className="font-semibold">Clean & Normalize</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                3
              </span>
              <span className="font-semibold">Discover Insights</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-5 h-5 rounded-full bg-[#ED1C24] text-white font-bold flex items-center justify-center text-[10px]">
                4
              </span>
              <span className="font-semibold text-slate-900">Act with Evidence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Dataset Overview Alert Banner if loaded */}
      {analysisResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Active Dataset Ready: {analysisResult.cleaningSummary.validReviews} customer reviews analyzed
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Top issue detected: <strong>{analysisResult.metrics.topTopic}</strong> | Generated{' '}
                <strong>{analysisResult.recommendations.length} prioritized recommendations</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('recommendations')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition shadow-xs cursor-pointer"
            >
              View Recommendations
            </button>
            <button
              onClick={() => setCurrentTab('insights')}
              className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Three Capability Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Key Capabilities
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Engineered with a pluggable architecture designed for AMD ROCm GPU acceleration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Capability 1: Sentiment Analysis */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <SmilePlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Sentiment Analysis
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Multi-signal sentiment engine combining rating data with transparent lexical polarity, negation windows, and confidence scoring. Works instantly offline without API tokens.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Positive, Neutral, and Negative segmentation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Sentiment-over-time trend analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Star rating correlation & confidence metrics
              </li>
            </ul>
          </div>

          {/* Capability 2: Topic Discovery */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Topic Discovery
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Deterministic categorization covering e-commerce domains: Shipping, Packaging, Sizing, Price & Value, Durability, Customer Support, and Setup Usability.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Predefined retail taxonomy & keyword matching
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Negative issue concentration metrics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Extracted verbatim customer evidence quotes
              </li>
            </ul>
          </div>

          {/* Capability 3: Actionable Recommendations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-[#ED1C24] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Actionable Recommendations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Prioritized business actions directly backed by data. Never hallucinates: every recommendation requires real customer excerpts, quantified impact, and an assigned functional team.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED1C24]" />
                High / Medium / Low urgency scoring
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED1C24]" />
                Assigned team ownership (Ops, Product, Support)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED1C24]" />
                Verifiable customer quote excerpts
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Trust & Architecture Banner */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Third-Party Data Leakage</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Local Execution by Default, AMD LLM Pluggable
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your uploaded CSV files are processed in memory and never shared with public LLM providers. Easily configure an internal AMD ROCm vLLM server to unlock deep semantic reasoning.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('about')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition shrink-0 shadow-sm cursor-pointer"
        >
          View AMD Architecture
        </button>
      </section>
    </div>
  );
};
