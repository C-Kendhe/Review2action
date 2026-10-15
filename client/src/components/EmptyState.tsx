import React from 'react';
import { UploadCloud, Sparkles, FolderArchive } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onUploadClick: () => void;
  onSampleClick: () => void;
  isLoading?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Review Data Loaded',
  description = 'Upload a CSV of customer reviews or load our pre-configured e-commerce sample to start generating insights.',
  onUploadClick,
  onSampleClick,
  isLoading = false
}) => {
  return (
    <div className="bg-white rounded-3xl p-10 md:p-14 border border-slate-200/90 shadow-xs text-center max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-[#ED1C24] flex items-center justify-center mx-auto mb-5 shadow-xs">
        <FolderArchive className="w-8 h-8" />
      </div>

      <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm md:text-base text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onUploadClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
        >
          <UploadCloud className="w-4 h-4 text-[#ED1C24]" />
          <span>Upload Customer Reviews CSV</span>
        </button>

        <button
          onClick={onSampleClick}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{isLoading ? 'Analyzing Sample...' : 'Try Sample Dataset'}</span>
        </button>
      </div>
    </div>
  );
};
