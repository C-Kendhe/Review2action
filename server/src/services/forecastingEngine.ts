import {
  NormalizedSmartStockRow,
  ForecastDataPoint,
  ForecastingMethodInfo,
  ForecastOptions
} from '../types/smartStock.js';

export interface SingleProductForecast {
  timeSeries: ForecastDataPoint[];
  averageDailyDemand: number;
  totalForecastDemand: number;
  horizonDays: number;
  detectedInterval: 'daily' | 'weekly';
  historicalDataPoints: number;
  forecastingMethod: ForecastingMethodInfo;
}

export class ForecastingEngine {
  /**
   * Generates demand forecast for a single product's historical series.
   */
  public static forecastProduct(
    rows: NormalizedSmartStockRow[],
    options: ForecastOptions = {}
  ): SingleProductForecast {
    const horizonDays = options.horizonDays && [7, 14, 30].includes(options.horizonDays)
      ? options.horizonDays
      : 14;

    // 1. Sort rows by date and aggregate multiple observations on the same date
    const dateMap = new Map<string, number>();
    for (const r of rows) {
      const current = dateMap.get(r.date) || 0;
      dateMap.set(r.date, current + r.units_sold);
    }

    const uniqueDates = Array.from(dateMap.keys()).sort();
    if (uniqueDates.length === 0) {
      throw new Error('No valid dates found for product forecasting.');
    }

    // 2. Fill missing dates with 0 units to form a continuous daily time series
    const continuousSeries: { date: string; units: number }[] = [];
    const startDate = new Date(uniqueDates[0]);
    const endDate = new Date(uniqueDates[uniqueDates.length - 1]);

    const cur = new Date(startDate);
    while (cur <= endDate) {
      const dateStr = cur.toISOString().split('T')[0];
      const units = dateMap.get(dateStr) ?? 0;
      continuousSeries.push({ date: dateStr, units });
      cur.setDate(cur.getDate() + 1);
    }

    const n = continuousSeries.length;
    const values = continuousSeries.map((d) => d.units);

    // 3. Select forecasting model based on history length and data richness
    let forecastMethod: ForecastingMethodInfo;
    let projectedDailyUnits: number[] = [];
    let standardError = 1.0;
    let backtestError: { metric: string; valuePercent: number; holdoutDays: number } | undefined;

    if (n < 5) {
      // Very sparse / short history (< 5 days) -> Simple Mean baseline
      const mean = values.reduce((a, b) => a + b, 0) / Math.max(1, n);
      projectedDailyUnits = Array(horizonDays).fill(Math.max(0.1, Math.round(mean * 10) / 10));
      standardError = Math.max(1, mean * 0.4);

      forecastMethod = {
        name: 'Simple Historical Mean Baseline',
        description: 'Arithmetic mean of limited historical observations.',
        limitations: 'History is very short (< 5 days). High uncertainty; cannot detect trend or weekly seasonality.',
        confidenceLevel: 'Low'
      };
    } else if (n < 14) {
      // Moderate history (5 - 13 days) -> 5-day / 7-day Moving Average
      const windowSize = Math.min(7, n);
      const recentWindow = values.slice(-windowSize);
      const ma = recentWindow.reduce((a, b) => a + b, 0) / windowSize;
      
      // Compute standard deviation of recent values for prediction intervals
      const variance = recentWindow.reduce((acc, v) => acc + Math.pow(v - ma, 2), 0) / windowSize;
      standardError = Math.max(0.5, Math.sqrt(variance));

      projectedDailyUnits = Array(horizonDays).fill(Math.max(0, Math.round(ma * 10) / 10));

      forecastMethod = {
        name: 'Moving Average Baseline (7-Day)',
        description: 'Rolling moving average weighted toward recent daily sales velocity.',
        limitations: 'History is under 2 weeks. Assumes steady sales; cannot capture monthly cycles or promotional spikes.',
        confidenceLevel: 'Medium'
      };
    } else {
      // Rich history (>= 14 days) -> Holt-Winters Double Exponential Smoothing with Day-of-Week Seasonality
      const alpha = 0.3; // Level smoothing
      const beta = 0.1;  // Trend smoothing
      
      // Calculate Day of Week Multipliers (Seasonality index)
      const daySums = [0, 0, 0, 0, 0, 0, 0];
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];
      for (const item of continuousSeries) {
        const dow = new Date(item.date).getDay();
        daySums[dow] += item.units;
        dayCounts[dow]++;
      }
      const overallMean = values.reduce((a, b) => a + b, 0) / n;
      const dowMultipliers = daySums.map((sum, i) => {
        const count = dayCounts[i] || 1;
        const avg = sum / count;
        return overallMean > 0 ? Math.max(0.4, Math.min(2.5, avg / overallMean)) : 1.0;
      });

      // Holt's linear trend initial values
      let level = values[0];
      let trend = (values[Math.min(6, n - 1)] - values[0]) / Math.min(6, n - 1);
      const residuals: number[] = [];

      for (let i = 1; i < n; i++) {
        const prevLevel = level;
        const actual = values[i];
        level = alpha * actual + (1 - alpha) * (prevLevel + trend);
        trend = beta * (level - prevLevel) + (1 - beta) * trend;
        
        // Clamp trend to prevent exploding forecasts
        trend = Math.max(-0.5 * level, Math.min(0.5 * level, trend));
        
        const predicted = prevLevel + trend;
        residuals.push(actual - predicted);
      }

      // Holdout backtest validation if n >= 21
      if (n >= 21) {
        const holdoutDays = 7;
        const trainValues = values.slice(0, n - holdoutDays);
        const testValues = values.slice(n - holdoutDays);

        let testLevel = trainValues[0];
        let testTrend = 0;
        for (let i = 1; i < trainValues.length; i++) {
          const prevL = testLevel;
          testLevel = alpha * trainValues[i] + (1 - alpha) * (prevL + testTrend);
          testTrend = beta * (testLevel - prevL) + (1 - beta) * testTrend;
        }

        let absErrorsSum = 0;
        let actualSum = 0;
        for (let h = 1; h <= holdoutDays; h++) {
          const testDow = new Date(continuousSeries[n - holdoutDays + h - 1].date).getDay();
          const seasonalPred = Math.max(0, (testLevel + h * testTrend) * dowMultipliers[testDow]);
          const actualVal = testValues[h - 1];
          absErrorsSum += Math.abs(actualVal - seasonalPred);
          actualSum += actualVal;
        }

        const wape = actualSum > 0 ? (absErrorsSum / actualSum) * 100 : 0;
        backtestError = {
          metric: 'WAPE (Weighted Absolute Error)',
          valuePercent: Math.round(wape * 10) / 10,
          holdoutDays
        };
      }

      // Calculate residual variance for prediction interval
      const variance = residuals.length > 0
        ? residuals.reduce((acc, r) => acc + r * r, 0) / residuals.length
        : 1.0;
      standardError = Math.max(0.6, Math.sqrt(variance));

      // Generate future forecast
      const lastDate = new Date(continuousSeries[n - 1].date);
      for (let h = 1; h <= horizonDays; h++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + h);
        const nextDow = nextDate.getDay();

        // Dampen trend over horizon to prevent divergence
        const dampedTrend = trend * Math.pow(0.92, h);
        const rawForecast = Math.max(0, level + h * dampedTrend);
        const seasonalForecast = Math.max(0, rawForecast * dowMultipliers[nextDow]);
        projectedDailyUnits.push(Math.round(seasonalForecast * 10) / 10);
      }

      forecastMethod = {
        name: 'Trend-Adjusted Exponential Smoothing with Day-of-Week Seasonality',
        description: 'Holt linear trend model combined with 7-day cyclical seasonality indexing.',
        limitations: 'Does not account for future unplanned marketing promotions or external supply chain disruptions.',
        confidenceLevel: backtestError && backtestError.valuePercent < 25 ? 'High' : 'Medium',
        backtestError
      };
    }

    // 4. Build complete Time Series (Historical + Forecast)
    const timeSeries: ForecastDataPoint[] = [];

    // Historical portion
    for (const item of continuousSeries) {
      timeSeries.push({
        date: item.date,
        historicalUnits: item.units,
        forecastUnits: null,
        lowerBound: null,
        upperBound: null
      });
    }

    // Future Forecast portion
    const lastHistDate = new Date(continuousSeries[n - 1].date);
    for (let h = 0; h < horizonDays; h++) {
      const forecastDate = new Date(lastHistDate);
      forecastDate.setDate(lastHistDate.getDate() + h + 1);
      const dateStr = forecastDate.toISOString().split('T')[0];

      const projected = projectedDailyUnits[h];
      // Uncertainty interval expands proportionally with horizon distance sqrt(h + 1)
      const uncertainty = 1.645 * standardError * Math.sqrt((h + 1) * 0.4 + 0.6);
      const lower = Math.max(0, Math.round((projected - uncertainty) * 10) / 10);
      const upper = Math.round((projected + uncertainty) * 10) / 10;

      timeSeries.push({
        date: dateStr,
        historicalUnits: null,
        forecastUnits: projected,
        lowerBound: lower,
        upperBound: upper
      });
    }

    const totalForecastDemand = Math.round(projectedDailyUnits.reduce((a, b) => a + b, 0) * 10) / 10;
    const averageDailyDemand = Math.round((totalForecastDemand / horizonDays) * 100) / 100;

    return {
      timeSeries,
      averageDailyDemand,
      totalForecastDemand,
      horizonDays,
      detectedInterval: 'daily',
      historicalDataPoints: n,
      forecastingMethod: forecastMethod
    };
  }
}
