import type { ApiResponse, AnalysisResult } from '../types';
import type { SmartStockForecastResult } from '../types/smartStock';

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

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

/**
 * Safely parses response from backend, guarding against HTML / non-JSON responses
 * and structured API error responses.
 */
async function parseJsonResponse<T>(response: Response, defaultErrorMessage: string): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  let payload: any = null;

  if (contentType.includes('application/json')) {
    try {
      payload = await response.json();
    } catch (parseErr: any) {
      throw new ApiError(
        `Failed to parse server response as JSON (HTTP ${response.status}): ${parseErr.message}`,
        'INVALID_JSON'
      );
    }
  } else {
    // Non-JSON response (e.g., HTML 404, 502/504 gateway error, or Vercel SPA routing)
    const text = await response.text();
    const snippet = text.slice(0, 160).trim();
    throw new ApiError(
      `Received non-JSON response from server (HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}). ` +
      `Please ensure backend API is running and reachable. ` +
      (snippet ? `Response preview: ${snippet}` : ''),
      'NON_JSON_RESPONSE'
    );
  }

  const apiData = payload as ApiResponse<T>;
  if (!response.ok || !apiData?.success || !apiData?.data) {
    throw new ApiError(
      apiData?.error?.message || `${defaultErrorMessage} (HTTP ${response.status})`,
      apiData?.error?.code || 'REQUEST_FAILED',
      apiData?.error?.details
    );
  }

  return apiData.data;
}

export const api = {
  /**
   * Upload CSV file for cleaning and analysis
   */
  async uploadCsv(file: File): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/reviews/analyze`, {
      method: 'POST',
      body: formData
    });

    return parseJsonResponse<AnalysisResult>(
      response,
      'Upload and review analysis failed'
    );
  },

  /**
   * Fetch sample pre-analyzed dataset directly for 1-click test
   */
  async fetchSampleAnalysis(): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/sample-data`);
    return parseJsonResponse<AnalysisResult>(
      response,
      'Failed to load sample dataset'
    );
  },

  /**
   * Get URL for downloading the raw sample CSV file
   */
  getSampleCsvUrl(): string {
    return `${API_BASE_URL}/api/reviews/sample-csv`;
  },

  /**
   * Upload SmartStock CSV file for demand forecasting and inventory analysis
   */
  async uploadSmartStockCsv(file: File, horizonDays = 14): Promise<SmartStockForecastResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('horizonDays', String(horizonDays));

    const response = await fetch(`${API_BASE_URL}/api/smartstock/forecast?horizonDays=${horizonDays}`, {
      method: 'POST',
      body: formData
    });

    return parseJsonResponse<SmartStockForecastResult>(
      response,
      'Demand forecast failed'
    );
  },

  /**
   * Fetch sample SmartStock forecast computed on bundled dataset
   */
  async fetchSmartStockSample(horizonDays = 14): Promise<SmartStockForecastResult> {
    const response = await fetch(`${API_BASE_URL}/api/smartstock/sample-data?horizonDays=${horizonDays}`);
    return parseJsonResponse<SmartStockForecastResult>(
      response,
      'Failed to load SmartStock sample dataset'
    );
  },

  /**
   * Get URL for downloading the sample SmartStock CSV file
   */
  getSmartStockSampleCsvUrl(): string {
    return `${API_BASE_URL}/api/smartstock/sample-csv`;
  },

  /**
   * Health check
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.success);
    } catch {
      return false;
    }
  }
};
