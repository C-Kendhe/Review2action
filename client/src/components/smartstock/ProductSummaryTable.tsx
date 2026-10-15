import React, { useState, useMemo } from 'react';
import {
  ProductForecastResult,
  StockoutRiskLevel
} from '../../types/smartStock';
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowUpDown,
  Calculator,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

interface ProductSummaryTableProps {
  products: ProductForecastResult[];
  categories: string[];
  horizonDays: number;
  onSelectProductForChart: (productId: string) => void;
  onOpenDetails: (product: ProductForecastResult) => void;
  selectedProductId?: string;
}

export const ProductSummaryTable: React.FC<ProductSummaryTableProps> = ({
  products,
  categories,
  horizonDays,
  onSelectProductForChart,
  onOpenDetails,
  selectedProductId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'demand' | 'daysLeft' | 'reorder'>('risk');

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.product_id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchesRisk =
          selectedRisk === 'ALL' || p.stockoutRisk === selectedRisk;
        return matchesSearch && matchesCategory && matchesRisk;
      })
      .sort((a, b) => {
        if (sortBy === 'risk') {
          const priority: Record<string, number> = { High: 0, Medium: 1, Unknown: 2, Low: 3 };
          return (priority[a.stockoutRisk] ?? 4) - (priority[b.stockoutRisk] ?? 4);
        }
        if (sortBy === 'demand') {
          return b.totalForecastDemand - a.totalForecastDemand;
        }
        if (sortBy === 'daysLeft') {
          const aDays = a.estimatedDaysUntilStockout ?? 9999;
          const bDays = b.estimatedDaysUntilStockout ?? 9999;
          return aDays - bDays;
        }
        if (sortBy === 'reorder') {
          return (b.suggestedReorderQuantity || 0) - (a.suggestedReorderQuantity || 0);
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedRisk, sortBy]);

  const getRiskBadge = (risk: StockoutRiskLevel) => {
    switch (risk) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-[#ED1C24] border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-[#ED1C24]" />
            High Risk
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-700" />
            Medium Risk
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-700" />
            Low Risk
          </span>
        );
      case 'Unknown':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Missing inventory or lead-time data">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            Unknown
          </span>
        );
    }
  };

  const getDaysLeftBadge = (product: ProductForecastResult) => {
    if (product.estimatedDaysUntilStockout === null) {
      return (
        <span className="text-xs text-slate-400 font-mono" title={product.daysUntilStockoutReason}>
          N/A*
        </span>
      );
    }

    const days = product.estimatedDaysUntilStockout;
    const leadTime = product.leadTimeDays;

    if (days <= 0) {
      return (
        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-rose-700 text-white animate-pulse">
          0 days (Out of Stock)
        </span>
      );
    }

    if (leadTime !== null && days <= leadTime) {
      return (
        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-rose-100 text-[#ED1C24] border border-rose-300">
          {days} days (&lt; lead time)
        </span>
      );
    }

    if (days <= horizonDays) {
      return (
        <span className="px-2 py-0.5 rounded-md font-semibold text-xs bg-amber-100 text-amber-900 border border-amber-200">
          {days} days
        </span>
      );
    }

    return (
      <span className="px-2 py-0.5 rounded-md font-semibold text-xs bg-slate-100 text-slate-700">
        {days} days
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Controls Bar: Search & Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="Low">Low Risk Only</option>
            <option value="Unknown">Unknown Data Only</option>
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="risk">Sort by Risk Severity</option>
              <option value="demand">Sort by Highest Demand</option>
              <option value="daysLeft">Sort by Shortest Runway</option>
              <option value="reorder">Sort by Reorder Quantity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Canvas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Product & SKU</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Current Stock</th>
              <th className="py-3 px-3">Forecast Demand</th>
              <th className="py-3 px-3">Days Until Stockout</th>
              <th className="py-3 px-3">Stockout Risk</th>
              <th className="py-3 px-3">Reorder Point</th>
              <th className="py-3 px-3">Suggested Reorder</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                  No products matched the selected filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = p.product_id === selectedProductId;
                return (
                  <tr
                    key={p.product_id}
                    className={`transition-colors hover:bg-slate-50/90 ${
                      isSelected ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    {/* Product & SKU */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-snug">
                          {p.product_name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {p.product_id}
                          {p.price !== null && ` • $${p.price.toFixed(2)}`}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {p.category}
                      </span>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-3">
                      {p.currentInventory !== null ? (
                        <span className={`font-mono font-bold ${
                          p.currentInventory === 0
                            ? 'text-rose-600'
                            : p.currentInventory < 25
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}>
                          {p.currentInventory.toLocaleString()} units
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not Provided</span>
                      )}
                    </td>

                    {/* Forecast Demand */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 font-mono">
                          {p.totalForecastDemand.toLocaleString()} units
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.averageDailyDemand} / day
                        </span>
                      </div>
                    </td>

                    {/* Days Until Stockout */}
                    <td className="py-3 px-3">
                      {getDaysLeftBadge(p)}
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3 px-3">
                      {getRiskBadge(p.stockoutRisk)}
                    </td>

                    {/* Reorder Point */}
                    <td className="py-3 px-3">
                      {p.reorderPoint !== null ? (
                        <span className="font-mono font-semibold text-slate-800">
                          {p.reorderPoint} units
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic" title={p.reorderPointReason}>
                          Missing Lead Time
                        </span>
                      )}
                    </td>

                    {/* Suggested Reorder */}
                    <td className="py-3 px-3">
                      {p.suggestedReorderQuantity !== null ? (
                        p.suggestedReorderQuantity > 0 ? (
                          <span className="inline-flex items-center gap-1 font-mono font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                            +{p.suggestedReorderQuantity.toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-mono text-emerald-700 font-semibold">
                            0 (Adequate)
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-400 italic" title={p.suggestedReorderReason}>
                          Missing Stock
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectProductForChart(p.product_id)}
                          title="View time-series forecast on the chart"
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                        >
                          Chart
                        </button>
                        <button
                          onClick={() => onOpenDetails(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer shadow-xs"
                        >
                          <Calculator className="w-3 h-3 text-[#ED1C24]" />
                          <span>Math & Evidence</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Notes on Missing Fields */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>
          Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> catalog products.
        </span>
        <span className="text-slate-400">
          * Missing optional fields (inventory_level, lead_time_days) are transparently marked as N/A and never hallucinated.
        </span>
      </div>
    </div>
  );
};
