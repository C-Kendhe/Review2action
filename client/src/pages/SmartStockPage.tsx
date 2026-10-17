import React, { useState, useRef } from 'react';
import {
  SmartStockForecastResult,
  ProductForecastResult
} from '../types/smartStock';
import { api } from '../services/api';
import { SmartStockKpiCards } from '../components/smartstock/SmartStockKpiCards';
import { DemandChart } from '../components/smartstock/DemandChart';
import { ProductSummaryTable } from '../components/smartstock/ProductSummaryTable';
import { ProductDetailModal } from '../components/smartstock/ProductDetailModal';
import { ValidationSummaryView } from '../components/smartstock/ValidationSummaryView';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  PackageCheck,
  TrendingUp
} from 'lucide-react';

interface SmartStockPageProps {
  smartStockResult: SmartStockForecastResult | null;
  setSmartStockResult: (result: SmartStockForecastResult | null) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const SmartStockPage: React.FC<SmartStockPageProps> = ({
  smartStockResult,
  setSmartStockResult,
  showToast
}) => {
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Forecasting product demand...');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [modalProduct, setModalProduct] = useState<ProductForecastResult | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pick first product as default for the chart when results load
  React.useEffect(() => {
    if (smartStockResult && smartStockResult.products.length > 0) {
      if (!selectedProductId || !smartStockResult.products.some(p => p.product_id === selectedProductId)) {
        setSelectedProductId(smartStockResult.products[0].product_id);
      }
    }
  }, [smartStockResult, selectedProductId]);

  // Active product for demand chart
  const activeProduct = smartStockResult?.products.find((p) => p.product_id === selectedProductId)
    || smartStockResult?.products[0]
    || null;

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        setErrorMessage('Only CSV files (.csv) are accepted.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Run Forecast on uploaded file
  const handleForecastDemand = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or drag a CSV file first, or click "Try Sample Data".');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingMessage(`Calculating statistical demand forecast over ${horizonDays}-day horizon...`);

    try {
      const data = await api.uploadSmartStockCsv(selectedFile, horizonDays);
      setSmartStockResult(data);
      showToast(`Forecast complete! Analyzed ${data.kpis.totalProducts} products over ${data.horizonDays} days.`);
    } catch (err: any) {
      console.error('[SmartStock Forecast Error]', err);
      setErrorMessage(err.message || 'Demand forecast failed. Please check your CSV format.');
      showToast(err.message || 'Forecast failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Run 1-Click Sample Forecast
  const handleTrySampleData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingMessage(`Loading 92-day sales history & forecasting next ${horizonDays} days...`);

    try {
      const data = await api.fetchSmartStockSample(horizonDays);
      setSmartStockResult(data);
      showToast(`Loaded sample dataset: ${data.kpis.totalProducts} products analyzed with ${data.kpis.highRiskProductsCount} high stockout risk items.`);
    } catch (err: any) {
      console.error('[SmartStock Sample Error]', err);
      setErrorMessage(err.message || 'Failed to load sample dataset.');
      showToast('Failed to load sample data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Recalculate with different horizon
  const handleHorizonChange = async (newHorizon: number) => {
    setHorizonDays(newHorizon);
    if (smartStockResult) {
      setIsLoading(true);
      setLoadingMessage(`Updating demand forecasts for ${newHorizon}-day horizon...`);
      try {
        if (selectedFile) {
          const data = await api.uploadSmartStockCsv(selectedFile, newHorizon);
          setSmartStockResult(data);
        } else {
          const data = await api.fetchSmartStockSample(newHorizon);
          setSmartStockResult(data);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to update horizon', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ED1C24] to-rose-500 flex items-center justify-center text-white shadow-xs">
              <PackageCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              SmartStock <span className="text-[#ED1C24]">AI</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-100">
              Inventory & Demand Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Forecast product demand and plan reorders before stock runs low.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={api.getSmartStockSampleCsvUrl()}
            download="smartstock_sample_inventory.csv"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample CSV</span>
          </a>

          <button
            onClick={handleTrySampleData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ED1C24]" />
            <span>Try Sample Data</span>
          </button>
        </div>
      </div>

      {/* Upload & Planning Controls Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              Upload Sales & Inventory Data
            </h2>
            <p className="text-xs text-slate-500">
              Required columns: <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">date</code>, <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">product_id</code>, <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">units_sold</code> (aliases accepted).
            </p>
          </div>

          {/* Planning Horizon Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Planning Horizon:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => handleHorizonChange(days)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    horizonDays === days
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-rose-500 bg-rose-50/50'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/20'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600">
            {selectedFile ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <UploadCloud className="w-6 h-6 text-slate-500" />
            )}
          </div>

          <div>
            {selectedFile ? (
              <>
                <p className="text-sm font-bold text-slate-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click or drag to replace
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-800">
                  Click to select CSV or drag and drop your file here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports standard CSVs up to 10MB (max 15,000 rows). Processed strictly in-memory.
                </p>
              </>
            )}
          </div>

          {/* Trigger Forecast CTA */}
          <div className="pt-2 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleForecastDemand}
              disabled={isLoading || !selectedFile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#ED1C24] hover:bg-rose-600 transition shadow-sm hover:shadow disabled:opacity-40 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Forecast Demand ({horizonDays} Days)</span>
            </button>

            <button
              onClick={handleTrySampleData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ED1C24]" />
              <span>Try Sample Data</span>
            </button>
          </div>
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
            <AlertCircle className="w-5 h-5 text-[#ED1C24] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Validation or Forecasting Error:</span>
              <p className="leading-relaxed">{errorMessage}</p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={handleTrySampleData}
                  className="font-bold underline text-[#ED1C24] hover:text-rose-900 cursor-pointer"
                >
                  Load verified sample dataset instead
                </button>
                <span>or check your column headers.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Results / Loading Area */}
      {isLoading ? (
        <LoadingSkeleton message={loadingMessage} />
      ) : smartStockResult ? (
        <div className="space-y-6">
          {/* Data Quality & Validation Summary */}
          <ValidationSummaryView summary={smartStockResult.validationSummary} />

          {/* KPI Summary Cards */}
          <SmartStockKpiCards kpis={smartStockResult.kpis} />

          {/* Demand Forecast Chart */}
          {activeProduct && (
            <DemandChart
              product={activeProduct}
              allProducts={smartStockResult.products}
              onSelectProduct={setSelectedProductId}
              horizonDays={smartStockResult.horizonDays}
            />
          )}

          {/* Product Summary Table */}
          <ProductSummaryTable
            products={smartStockResult.products}
            categories={smartStockResult.categories}
            horizonDays={smartStockResult.horizonDays}
            onSelectProductForChart={(pId) => {
              setSelectedProductId(pId);
              // Smooth scroll to chart
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }}
            onOpenDetails={(p) => setModalProduct(p)}
            selectedProductId={selectedProductId}
          />
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
            <PackageCheck className="w-7 h-7 text-[#ED1C24]" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              No Inventory Forecast Active
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your historical CSV data above or click <strong>Try Sample Data</strong> to explore immediate statistical demand forecasts, stockout risk ratings, and replenishment calculations.
            </p>
          </div>
          <button
            onClick={handleTrySampleData}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#ED1C24]" />
            <span>Load Realistic Multi-Product Sample</span>
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
      />
    </div>
  );
};
