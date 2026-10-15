export type StockoutRiskLevel = 'High' | 'Medium' | 'Low' | 'Unknown';

export interface InvalidRowDetail {
  rowNumber: number;
  reason: string;
  sampleData?: string;
}

export interface ProductSummaryInUpload {
  product_id: string;
  product_name?: string;
  category?: string;
  rowCount: number;
  totalHistoricalUnits: number;
  latestInventory?: number;
  leadTimeDays?: number;
}

export interface NormalizedSmartStockRow {
  date: string;
  product_id: string;
  units_sold: number;
  product_name?: string;
  price?: number;
  inventory_level?: number;
  promotion?: boolean;
  category?: string;
  lead_time_days?: number;
  safety_stock?: number;
}

export interface SmartStockValidationSummary {
  totalUploaded: number;
  validRows: number;
  invalidRowsCount: number;
  invalidRows: InvalidRowDetail[];
  duplicateRowsCount: number;
  duplicateHandlingExplanation: string;
  detectedHeaders: string[];
  mappedHeaders: Record<string, string>;
  detectedInterval: 'daily' | 'weekly' | 'irregular';
  productsFound: ProductSummaryInUpload[];
  dateRange: {
    start: string;
    end: string;
    totalDays: number;
  } | null;
  missingOptionalColumns: string[];
  presentOptionalColumns: string[];
  samplePreview: NormalizedSmartStockRow[];
}

export interface ForecastDataPoint {
  date: string;
  historicalUnits: number | null;
  forecastUnits: number | null;
  lowerBound: number | null;
  upperBound: number | null;
}

export interface ForecastingMethodInfo {
  name: string;
  description: string;
  limitations: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  backtestError?: {
    metric: string;
    valuePercent: number;
    holdoutDays: number;
  };
}

export interface InventoryCalculationDetails {
  avgDailyDemandFormula: string;
  demandDuringLeadTime: number | null;
  reorderPointFormula: string;
  suggestedReorderFormula: string;
  safetyStockUsed: number;
  assumptions: string[];
}

export interface ProductForecastResult {
  product_id: string;
  product_name: string;
  category: string;
  price: number | null;
  currentInventory: number | null;
  leadTimeDays: number | null;
  safetyStock: number | null;
  historicalDataPoints: number;
  detectedInterval: 'daily' | 'weekly';
  averageDailyDemand: number;
  totalForecastDemand: number;
  horizonDays: number;
  estimatedDaysUntilStockout: number | null;
  daysUntilStockoutReason?: string;
  reorderPoint: number | null;
  reorderPointReason?: string;
  suggestedReorderQuantity: number | null;
  suggestedReorderReason?: string;
  stockoutRisk: StockoutRiskLevel;
  riskReason: string;
  forecastingMethod: ForecastingMethodInfo;
  calculationDetails: InventoryCalculationDetails;
  explanation: string;
  timeSeries: ForecastDataPoint[];
}

export interface SmartStockKpis {
  totalProducts: number;
  highRiskProductsCount: number;
  mediumRiskProductsCount: number;
  lowRiskProductsCount: number;
  unknownRiskCount: number;
  totalForecastDemandAllProducts: number;
  totalSuggestedReorderUnits: number;
  horizonDays: number;
}

export interface SmartStockForecastResult {
  validationSummary: SmartStockValidationSummary;
  kpis: SmartStockKpis;
  products: ProductForecastResult[];
  categories: string[];
  horizonDays: number;
  providerInfo: {
    providerName: string;
    isLocal: boolean;
    llmReady: boolean;
    modelName?: string;
    disclaimer: string;
  };
}
