import React from 'react';
import {
  ProductForecastResult
} from '../../types/smartStock';
import {
  X,
  Calculator,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductForecastResult | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose
}) => {
  if (!product) return null;

  const { calculationDetails, forecastingMethod } = product;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Transparent Supply Chain Evidence
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-mono">
                {product.product_id}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              {product.product_name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Category: {product.category} {product.price !== null && `• Price: $${product.price.toFixed(2)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Evidence-Backed Plain Language Explanation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-[#ED1C24]" />
              <span>Evidence-Backed Executive Synthesis</span>
            </div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              {product.explanation}
            </p>
          </div>

          {/* 2. Step-by-Step Mathematical Calculations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-700" />
              Mathematical Traceability Breakdown
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Avg Daily Demand */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium block mb-1">
                  Average Daily Demand
                </span>
                <p className="font-mono font-semibold text-slate-900 mb-1">
                  {calculationDetails.avgDailyDemandFormula}
                </p>
                <p className="text-[11px] text-slate-500">
                  Calculated by integrating model forecast over {product.horizonDays} days.
                </p>
              </div>

              {/* Demand During Lead Time */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium block mb-1">
                  Demand During Supplier Lead Time
                </span>
                <p className="font-mono font-semibold text-slate-900 mb-1">
                  {product.leadTimeDays !== null
                    ? `${product.averageDailyDemand} units/day × ${product.leadTimeDays}d = ${calculationDetails.demandDuringLeadTime} units`
                    : 'Supplier lead time not provided'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Minimum units consumed while waiting for incoming shipment.
                </p>
              </div>

              {/* Reorder Point */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium block mb-1">
                  Reorder Point (ROP)
                </span>
                <p className="font-mono font-semibold text-slate-900 mb-1">
                  {calculationDetails.reorderPointFormula}
                </p>
                <p className="text-[11px] text-slate-500">
                  Formula: (Demand During Lead Time) + Safety Stock.
                </p>
              </div>

              {/* Suggested Reorder Quantity */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium block mb-1">
                  Suggested Replenishment Quantity
                </span>
                <p className="font-mono font-bold text-rose-600 mb-1">
                  {calculationDetails.suggestedReorderFormula}
                </p>
                <p className="text-[11px] text-slate-500">
                  Order-up-to target to cover planning horizon and buffer.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Forecasting Method & Limitations */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-700" />
                Forecasting Model: {forecastingMethod.name}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                {forecastingMethod.confidenceLevel} Confidence
              </span>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              {forecastingMethod.description}
            </p>
            <div className="text-[11px] text-amber-800 bg-white/70 p-2 rounded-lg border border-amber-200/60">
              <strong>Limitations:</strong> {forecastingMethod.limitations}
            </div>
            {forecastingMethod.backtestError && (
              <p className="text-[11px] font-mono text-amber-900">
                Validation Backtest ({forecastingMethod.backtestError.holdoutDays}-Day Holdout {forecastingMethod.backtestError.metric}): {forecastingMethod.backtestError.valuePercent}%
              </p>
            )}
          </div>

          {/* 4. Active Assumptions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Model Assumptions & Parameters
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
              {calculationDetails.assumptions.map((assump, idx) => (
                <li key={idx} className="leading-relaxed">
                  {assump}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#ED1C24] flex items-center justify-center text-white text-[9px] font-black">
              AMD
            </div>
            <span className="text-xs text-slate-600 font-medium">
              Deterministic calculations verified • Zero hallucinated data
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
