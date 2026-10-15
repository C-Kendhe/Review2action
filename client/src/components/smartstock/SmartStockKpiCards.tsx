import React from 'react';
import { Package, AlertTriangle, TrendingUp, PackagePlus } from 'lucide-react';
import { KpiCard } from '../KpiCard';
import { SmartStockKpis } from '../../types/smartStock';

interface SmartStockKpiCardsProps {
  kpis: SmartStockKpis;
}

export const SmartStockKpiCards: React.FC<SmartStockKpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Products Forecasted */}
      <KpiCard
        title="Products Forecasted"
        value={kpis.totalProducts}
        subtext={`${kpis.horizonDays}-day planning horizon active`}
        icon={Package}
        badge="Ready"
        badgeColor="bg-slate-100 text-slate-700"
      />

      {/* 2. High Stockout Risk */}
      <KpiCard
        title="High Stockout Risk"
        value={kpis.highRiskProductsCount}
        subtext={
          kpis.highRiskProductsCount > 0
            ? 'Stock will run out before supplier lead time'
            : 'All products have adequate stock runway'
        }
        icon={AlertTriangle}
        badge={kpis.highRiskProductsCount > 0 ? 'Action Needed' : 'Stable'}
        badgeColor={
          kpis.highRiskProductsCount > 0
            ? 'bg-rose-100 text-[#ED1C24] font-bold'
            : 'bg-emerald-100 text-emerald-800'
        }
        accentColor={kpis.highRiskProductsCount > 0 ? 'text-[#ED1C24]' : 'text-slate-900'}
      />

      {/* 3. Total Forecast Demand */}
      <KpiCard
        title="Total Forecast Demand"
        value={`${Math.round(kpis.totalForecastDemandAllProducts).toLocaleString()} units`}
        subtext={`Aggregated across ${kpis.totalProducts} catalog products`}
        icon={TrendingUp}
        badge={`${kpis.horizonDays} Days`}
        badgeColor="bg-blue-50 text-blue-700"
      />

      {/* 4. Suggested Replenishment Units */}
      <KpiCard
        title="Suggested Reorder Units"
        value={`${Math.round(kpis.totalSuggestedReorderUnits).toLocaleString()} units`}
        subtext="To cover forecast horizon + safety buffer"
        icon={PackagePlus}
        badge="Order Recommendation"
        badgeColor="bg-amber-100 text-amber-900 font-semibold"
        accentColor="text-amber-600"
      />
    </div>
  );
};
