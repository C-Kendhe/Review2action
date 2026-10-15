import React, { useState } from 'react';
import {
  SmartStockValidationSummary
} from '../../types/smartStock';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Database,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';

interface ValidationSummaryViewProps {
  summary: SmartStockValidationSummary;
}

export const ValidationSummaryView: React.FC<ValidationSummaryViewProps> = ({ summary }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Data Quality & Validation Summary
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {summary.validRows.toLocaleString()} Rows Cleaned
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {summary.productsFound.length} unique products • Interval: <span className="capitalize font-semibold text-slate-700">{summary.detectedInterval}</span> {summary.dateRange && `• ${summary.dateRange.start} to ${summary.dateRange.end} (${summary.dateRange.totalDays} days)`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {summary.invalidRowsCount > 0 && (
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 text-[#ED1C24] border border-rose-200 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#ED1C24]" />
              {summary.invalidRowsCount} Excluded Rows
            </span>
          )}
          <button className="text-slate-400 hover:text-slate-700 p-1">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 font-medium block">Total Uploaded</span>
              <span className="text-base font-bold text-slate-900">
                {summary.totalUploaded.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 font-medium block">Valid Observations</span>
              <span className="text-base font-bold text-emerald-700">
                {summary.validRows.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 font-medium block">Duplicates Handled</span>
              <span className="text-base font-bold text-slate-700">
                {summary.duplicateRowsCount}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 font-medium block">Products Identified</span>
              <span className="text-base font-bold text-slate-900">
                {summary.productsFound.length}
              </span>
            </div>
          </div>

          {/* Duplicate Handling Note */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="text-slate-600">
              <strong>Duplicate Strategy:</strong> {summary.duplicateHandlingExplanation}
            </span>
          </div>

          {/* Missing vs Present Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">
                Detected Optional Columns:
              </span>
              <div className="flex flex-wrap gap-1">
                {summary.presentOptionalColumns.length > 0 ? (
                  summary.presentOptionalColumns.map((col) => (
                    <span key={col} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-mono">
                      {col}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">
                Missing Optional Columns:
              </span>
              <div className="flex flex-wrap gap-1">
                {summary.missingOptionalColumns.length > 0 ? (
                  summary.missingOptionalColumns.map((col) => (
                    <span key={col} className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded text-[11px] font-mono">
                      {col}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">All optional columns present</span>
                )}
              </div>
            </div>
          </div>

          {/* Excluded Rows Breakdown if any */}
          {summary.invalidRows.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-rose-700 block">
                Excluded Rows & Reasons (First {summary.invalidRows.length} reported):
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-3 rounded-xl border border-rose-200 text-[11px]">
                {summary.invalidRows.map((inv, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="font-mono font-bold text-rose-600 shrink-0">
                      Row {inv.rowNumber}:
                    </span>
                    <span>{inv.reason}</span>
                    {inv.sampleData && (
                      <span className="text-slate-400 font-mono text-[10px]">
                        ({inv.sampleData})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
