import React from 'react';

export const LoadingSkeleton: React.FC<{ message?: string }> = ({
  message = 'Cleaning and analyzing reviews with local heuristic engine...'
}) => {
  return (
    <div className="w-full space-y-6 py-6 animate-pulse">
      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#ED1C24] animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800 mb-1">{message}</h3>
        <p className="text-xs text-slate-500 max-w-md">
          Normalizing headers, trimming whitespace, scoring sentiment with lexical polarity, and extracting topics...
        </p>
      </div>

      {/* KPI Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-7 w-28 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 h-72 flex flex-col justify-between">
          <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
          <div className="h-48 w-full bg-slate-100 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 h-72 flex flex-col justify-between">
          <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
          <div className="h-48 w-full bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
