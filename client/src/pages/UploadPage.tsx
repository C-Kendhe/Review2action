import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Info,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { AnalysisResult, PageTab } from '../types';

interface UploadPageProps {
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setCurrentTab: (tab: PageTab) => void;
  onLoadSample: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  analysisResult,
  setAnalysisResult,
  setCurrentTab,
  onLoadSample,
  isLoading,
  setIsLoading
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setErrorCode(null);

    // Validate extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Invalid file format: Only .csv files are supported.');
      setErrorCode('INVALID_FILE_TYPE');
      return;
    }

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10 MB limit. Please upload a smaller CSV file.');
      setErrorCode('FILE_TOO_LARGE');
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    try {
      const result = await api.uploadCsv(file);
      setAnalysisResult(result);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        setErrorCode(err.code);
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred during CSV processing.');
        setErrorCode('UPLOAD_ERROR');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSample = () => {
    window.location.href = api.getSampleCsvUrl();
  };

  const handleClear = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setErrorCode(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Explanation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Upload & Clean Customer Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Accepts any e-commerce CSV. Automatically normalizes headers, drops duplicates, and validates ratings.
          </p>
        </div>

        {/* Quick Sample Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Download realistic sample CSV with 35 e-commerce reviews"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Sample CSV</span>
          </button>

          <button
            onClick={onLoadSample}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition shadow-xs disabled:opacity-50 cursor-pointer"
            title="Load sample dataset directly into memory"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ED1C24]" />
            <span>{isLoading ? 'Analyzing...' : 'Test Sample Data'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 animate-shake">
          <AlertTriangle className="w-5 h-5 text-[#ED1C24] shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <div className="font-bold flex items-center justify-between">
              <span>CSV Validation Error {errorCode ? `(${errorCode})` : ''}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-600 hover:text-rose-900 font-normal underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-rose-800 leading-relaxed">{errorMessage}</p>
            {errorCode === 'INVALID_CSV_HEADERS' && (
              <div className="mt-2 p-2.5 rounded-lg bg-white/70 border border-rose-200 text-[11px] text-slate-700">
                <span className="font-semibold block mb-1">How to fix this:</span>
                Ensure your CSV has a column containing the review text. Common accepted names include:{' '}
                <code className="bg-rose-100 text-[#ED1C24] px-1 py-0.5 rounded font-mono">review_text</code>,{' '}
                <code className="bg-rose-100 text-[#ED1C24] px-1 py-0.5 rounded font-mono">review</code>,{' '}
                <code className="bg-rose-100 text-[#ED1C24] px-1 py-0.5 rounded font-mono">text</code>,{' '}
                <code className="bg-rose-100 text-[#ED1C24] px-1 py-0.5 rounded font-mono">comment</code>, or{' '}
                <code className="bg-rose-100 text-[#ED1C24] px-1 py-0.5 rounded font-mono">feedback</code>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-[#ED1C24] bg-rose-50/50 scale-[0.99]'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,application/vnd.ms-excel"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          {isLoading ? (
            <RefreshCw className="w-8 h-8 text-[#ED1C24] animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 text-slate-600" />
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
          {isLoading
            ? 'Cleaning & analyzing your CSV...'
            : 'Drag & drop your CSV file here, or click to browse'}
        </h3>

        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Strictly local processing. File size up to 10 MB and up to 10,000 review rows.
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#ED1C24]" />
          <span>Accepts .csv format</span>
        </div>

        {selectedFile && !isLoading && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </div>

      {/* Cleaning Summary Section (Rendered when analysisResult exists) */}
      {analysisResult && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Data Cleaning & Ingestion Summary
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Processed with automatic whitespace trimming, deduplication, and rating coercion.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Dataset</span>
              </button>

              <button
                onClick={() => setCurrentTab('insights')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs cursor-pointer"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#ED1C24]" />
              </button>
            </div>
          </div>

          {/* Metric Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Raw Rows Uploaded
              </span>
              <span className="text-xl font-black text-slate-900">
                {analysisResult.cleaningSummary.totalUploaded}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700 block uppercase">
                Valid Clean Reviews
              </span>
              <span className="text-xl font-black text-emerald-900">
                {analysisResult.cleaningSummary.validReviews}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Blank / Empty Dropped
              </span>
              <span className="text-xl font-black text-slate-700">
                {analysisResult.cleaningSummary.removedBlank}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Duplicates Removed
              </span>
              <span className="text-xl font-black text-slate-700">
                {analysisResult.cleaningSummary.removedDuplicates}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Valid Ratings Found
              </span>
              <span className="text-xl font-black text-slate-700">
                {analysisResult.cleaningSummary.hasRatingsCount}
              </span>
            </div>
          </div>

          {/* Header Mappings */}
          <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 text-xs">
            <span className="font-bold text-slate-800 block mb-1">
              Detected & Normalized Column Mappings:
            </span>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {Object.entries(analysisResult.cleaningSummary.mappedHeaders).map(([target, source]) => (
                <span
                  key={target}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                >
                  <strong className="text-slate-900">{source}</strong> → <span className="text-[#ED1C24] font-semibold">{target}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Sample Cleaned Preview Table */}
          {analysisResult.cleaningSummary.sampleCleanedPreview.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cleaned Data Preview (First 5 Rows)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5 text-center">Rating</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Cleaned Review Text</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysisResult.cleaningSummary.sampleCleanedPreview.map((row) => (
                      <tr key={row.review_id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono text-[11px] text-slate-500">{row.review_id}</td>
                        <td className="p-2.5 font-medium text-slate-800">{row.product_name ?? '—'}</td>
                        <td className="p-2.5 text-center font-bold text-slate-700">
                          {row.rating !== null ? `${row.rating} ★` : '—'}
                        </td>
                        <td className="p-2.5 text-slate-500 text-[11px]">{row.review_date ?? '—'}</td>
                        <td className="p-2.5 text-slate-700 max-w-md truncate" title={row.review_text}>
                          {row.review_text}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* CSV Schema Reference Guide */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Supported CSV Column Schema
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Column Name</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Accepted Synonyms</th>
                <th className="py-2.5 px-3">Purpose & Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-rose-600">review_text</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-[#ED1C24]">
                    Required
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  review, text, comment, content, feedback, body, message
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Primary customer review text analyzed for sentiment and topics.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-800">rating</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    Optional
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  stars, score, rate, star_rating, review_rating
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Numeric rating (1 to 5). Coerced; invalid ratings safely become null without dropping text.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-800">product_name</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    Optional
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  product, item, title, item_name, sku, model
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Allows grouping and filtering reviews by specific catalog product.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-800">review_date</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    Optional
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  date, created_at, timestamp, time, posted_at
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Enables sentiment-over-time trendline charts. Automatically parses ISO and standard dates.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-800">review_title</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    Optional
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  headline, summary, subject, title
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Displayed as review headline and factored into keyword matching.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Uploaded data stays within this local machine session. It is never transmitted externally.
          </span>
        </div>
      </section>
    </div>
  );
};
