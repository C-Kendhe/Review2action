import React from 'react';
import { Sparkles, Cpu, UploadCloud, Database, RefreshCw } from 'lucide-react';
import type { AnalysisResult, PageTab } from '../types';

interface HeaderProps {
  currentTab: PageTab;
  setCurrentTab: (tab: PageTab) => void;
  analysisResult: AnalysisResult | null;
  onLoadSample: () => void;
  isLoading: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  setCurrentTab,
  analysisResult,
  onLoadSample,
  isLoading,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hackathon Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 text-left group transition cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ED1C24] to-rose-500 flex items-center justify-center text-white shadow-sm shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    Review<span className="text-[#ED1C24]">2</span>Action
                  </span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-slate-100">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
                  Customer Review Intelligence Engine
                </p>
              </div>
            </button>

            {/* Hackathon Badge */}
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-slate-200 ml-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-[#ED1C24] border border-rose-200">
                <Cpu className="w-3 h-3 text-[#ED1C24]" />
                AMD Hackathon Prototype
              </span>
            </div>
          </div>

          {/* Right Header Status & Action Controls */}
          <div className="flex items-center gap-3">
            {analysisResult && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  <strong>{analysisResult.cleaningSummary.validReviews.toLocaleString()}</strong> reviews loaded
                </span>
              </div>
            )}

            <button
              onClick={onLoadSample}
              disabled={isLoading}
              title="Load realistic e-commerce reviews dataset instantly"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-500 transition disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ED1C24]' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Load Sample Data</span>
              <span className="sm:hidden">Sample</span>
            </button>

            <button
              onClick={() => setCurrentTab('upload')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-900 transition shadow-sm hover:shadow cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#ED1C24]" />
              <span>Upload CSV</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
