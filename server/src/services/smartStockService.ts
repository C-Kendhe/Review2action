import {
  NormalizedSmartStockRow,
  SmartStockValidationSummary,
  SmartStockForecastResult,
  ProductForecastResult,
  ForecastOptions,
  SmartStockKpis
} from '../types/smartStock.js';
import { SmartStockValidationService } from './smartStockValidationService.js';
import { ForecastingEngine } from './forecastingEngine.js';
import { InventoryService } from './inventoryService.js';
import {
  ExplanationProvider,
  TemplateExplanationProvider,
  LlmExplanationProvider
} from '../providers/explanationProvider.js';

export class SmartStockService {
  private llmProvider = new LlmExplanationProvider();
  private templateProvider = new TemplateExplanationProvider();

  private get explanationProvider(): ExplanationProvider {
    return process.env.USE_AMD_LLM === 'true'
      ? this.llmProvider
      : this.templateProvider;
  }

  /**
   * Main entrypoint: analyzes CSV content and returns complete demand forecast & replenishment plan
   */
  public async analyzeAndForecast(
    csvContent: string,
    options: ForecastOptions = {}
  ): Promise<SmartStockForecastResult> {
    const horizonDays = options.horizonDays && [7, 14, 30].includes(options.horizonDays)
      ? options.horizonDays
      : 14;

    // 1. Validate & normalize CSV
    const { rows, summary } = SmartStockValidationService.validateAndNormalize(csvContent);

    // 2. Group rows by product_id
    const productsMap = new Map<string, NormalizedSmartStockRow[]>();
    for (const row of rows) {
      if (!productsMap.has(row.product_id)) {
        productsMap.set(row.product_id, []);
      }
      productsMap.get(row.product_id)!.push(row);
    }

    const productResults: ProductForecastResult[] = [];
    const categoriesSet = new Set<string>();

    // 3. Forecast each product
    for (const [productId, productRows] of productsMap.entries()) {
      // Find metadata
      const latestWithName = [...productRows].reverse().find((r) => r.product_name);
      const latestWithCat = [...productRows].reverse().find((r) => r.category);
      const latestWithPrice = [...productRows].reverse().find((r) => r.price !== undefined);

      const productName = latestWithName?.product_name || productId;
      const category = latestWithCat?.category || 'General';
      const price = latestWithPrice?.price ?? null;

      categoriesSet.add(category);

      // Run statistical forecast
      const forecast = ForecastingEngine.forecastProduct(productRows, {
        horizonDays,
        preferredInterval: options.preferredInterval
      });

      // Run inventory calculations
      const inventory = InventoryService.calculateInventoryMetrics(productRows, forecast);

      // Generate evidence-based explanation locally without blocking batch forecasting
      const explanation = await this.templateProvider.generateExplanation({
        product_id: productId,
        product_name: productName,
        category,
        forecast,
        inventory
      });

      productResults.push({
        product_id: productId,
        product_name: productName,
        category,
        price,
        currentInventory: inventory.currentInventory,
        leadTimeDays: inventory.leadTimeDays,
        safetyStock: inventory.safetyStock,
        historicalDataPoints: forecast.historicalDataPoints,
        detectedInterval: forecast.detectedInterval,
        averageDailyDemand: forecast.averageDailyDemand,
        totalForecastDemand: forecast.totalForecastDemand,
        horizonDays,
        estimatedDaysUntilStockout: inventory.estimatedDaysUntilStockout,
        daysUntilStockoutReason: inventory.daysUntilStockoutReason,
        reorderPoint: inventory.reorderPoint,
        reorderPointReason: inventory.reorderPointReason,
        suggestedReorderQuantity: inventory.suggestedReorderQuantity,
        suggestedReorderReason: inventory.suggestedReorderReason,
        stockoutRisk: inventory.stockoutRisk,
        riskReason: inventory.riskReason,
        forecastingMethod: forecast.forecastingMethod,
        calculationDetails: inventory.calculationDetails,
        explanation,
        timeSeries: forecast.timeSeries
      });
    }

    // Sort products: High risk first, then Medium, Low, Unknown
    const riskPriority: Record<string, number> = { High: 0, Medium: 1, Unknown: 2, Low: 3 };
    productResults.sort((a, b) => {
      const pA = riskPriority[a.stockoutRisk] ?? 4;
      const pB = riskPriority[b.stockoutRisk] ?? 4;
      if (pA !== pB) return pA - pB;
      return b.totalForecastDemand - a.totalForecastDemand;
    });

    // 4. Compute Aggregate KPIs
    const highRisk = productResults.filter((p) => p.stockoutRisk === 'High').length;
    const medRisk = productResults.filter((p) => p.stockoutRisk === 'Medium').length;
    const lowRisk = productResults.filter((p) => p.stockoutRisk === 'Low').length;
    const unkRisk = productResults.filter((p) => p.stockoutRisk === 'Unknown').length;

    const totalDemandAll = Math.round(
      productResults.reduce((acc, p) => acc + p.totalForecastDemand, 0) * 10
    ) / 10;

    const totalSuggestedReorder = productResults.reduce((acc, p) => {
      return acc + (p.suggestedReorderQuantity || 0);
    }, 0);

    const kpis: SmartStockKpis = {
      totalProducts: productResults.length,
      highRiskProductsCount: highRisk,
      mediumRiskProductsCount: medRisk,
      lowRiskProductsCount: lowRisk,
      unknownRiskCount: unkRisk,
      totalForecastDemandAllProducts: totalDemandAll,
      totalSuggestedReorderUnits: totalSuggestedReorder,
      horizonDays
    };

    return {
      validationSummary: summary,
      kpis,
      products: productResults,
      categories: Array.from(categoriesSet).sort(),
      horizonDays,
      providerInfo: {
        providerName: this.explanationProvider.name,
        isLocal: process.env.USE_AMD_LLM !== 'true',
        llmReady: true,
        modelName: process.env.AMD_LLM_MODEL || 'Local Deterministic Template Engine',
        disclaimer: 'Forecasts and replenishment suggestions are generated from historical sales velocity and inventory lead times without external cloud APIs.'
      }
    };
  }

  public async explainProductLlm(context: import('../providers/explanationProvider.js').ExplanationContext): Promise<string> {
    return this.llmProvider.generateExplanation(context);
  }

  public getActiveProviderName(): string {
    return this.templateProvider.name;
  }
}

export const smartStockService = new SmartStockService();
