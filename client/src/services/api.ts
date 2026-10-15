import type { ApiResponse, AnalysisResult } from '../types';

export class ApiError extends Error {
  public code: string;
  public details?: unknown;

  constructor(message: string, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export const api = {
  /**
   * Upload CSV file for cleaning and analysis
   */
  async uploadCsv(file: File): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/reviews/analyze', {
      method: 'POST',
      body: formData
    });

    const data: ApiResponse<AnalysisResult> = await response.json();

    if (!response.ok || !data.success || !data.data) {
      throw new ApiError(
        data.error?.message || `Upload failed with HTTP ${response.status}`,
        data.error?.code || 'UPLOAD_FAILED',
        data.error?.details
      );
    }

    return data.data;
  },

  /**
   * Fetch sample pre-analyzed dataset directly for 1-click test
   */
  async fetchSampleAnalysis(): Promise<AnalysisResult> {
    const response = await fetch('/api/reviews/sample-data');
    const data: ApiResponse<AnalysisResult> = await response.json();

    if (!response.ok || !data.success || !data.data) {
      throw new ApiError(
        data.error?.message || 'Failed to load sample dataset',
        data.error?.code || 'FETCH_SAMPLE_FAILED'
      );
    }

    return data.data;
  },

  /**
   * Get URL for downloading the raw sample CSV file
   */
  getSampleCsvUrl(): string {
    return '/api/reviews/sample-csv';
  },

  /**
   * Upload SmartStock CSV file for demand forecasting and inventory analysis
   */
  async uploadSmartStockCsv(file: File, horizonDays = 14): Promise<import('../types/smartStock.js').SmartStockForecastResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('horizonDays', String(horizonDays));

    const response = await fetch(`/api/smartstock/forecast?horizonDays=${horizonDays}`, {
      method: 'POST',
      body: formData
    });

    const data: ApiResponse<import('../types/smartStock.js').SmartStockForecastResult> = await response.json();

    if (!response.ok || !data.success || !data.data) {
      throw new ApiError(
        data.error?.message || `Forecast failed with HTTP ${response.status}`,
        data.error?.code || 'FORECAST_FAILED',
        data.error?.details
      );
    }

    return data.data;
  },

  /**
   * Fetch sample pre-computed SmartStock forecast
   */
  async fetchSmartStockSample(horizonDays = 14): Promise<import('../types/smartStock.js').SmartStockForecastResult> {
    const response = await fetch(`/api/smartstock/sample-forecast?horizonDays=${horizonDays}`);
    const data: ApiResponse<import('../types/smartStock.js').SmartStockForecastResult> = await response.json();

    if (!response.ok || !data.success || !data.data) {
      throw new ApiError(
        data.error?.message || 'Failed to load SmartStock sample dataset',
        data.error?.code || 'FETCH_SAMPLE_FAILED'
      );
    }

    return data.data;
  },

  /**
   * Get URL for downloading the sample SmartStock CSV file
   */
  getSmartStockSampleCsvUrl(): string {
    return '/api/smartstock/sample-csv';
  },

  /**
   * Health check
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      return Boolean(data.success);
    } catch {
      return false;
    }
  }
};

