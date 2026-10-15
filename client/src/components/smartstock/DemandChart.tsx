import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ProductForecastResult } from '../../types/smartStock';
import { Sparkles, Info, ShieldCheck, AlertCircle } from 'lucide-react';

interface DemandChartProps {
  product: ProductForecastResult;
  allProducts: ProductForecastResult[];
  onSelectProduct: (productId: string) => void;
  horizonDays: number;
}

export const DemandChart: React.FC<DemandChartProps> = ({
  product,
  allProducts,
  onSelectProduct,
  horizonDays
}) => {
  // Format data points for recharts
  const chartData = product.timeSeries.map((pt) => {
    // Prediction interval range: [lowerBound, upperBound]
    const range = pt.lowerBound !== null && pt.upperBound !== null ? [pt.lowerBound, pt.upperBound] : null;
    return {
      date: pt.date,
      historical: pt.historicalUnits,
      forecast: pt.forecastUnits,
      lowerBound: pt.lowerBound,
      upperBound: pt.upperBound,
      range
    };
  });

  const formatDateTick = (tickStr: string) => {
    try {
      const parts = tickStr.split('-');
      if (parts.length === 3) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return `${monthNames[m]} ${d}`;
      }
      return tickStr;
    } catch {
      return tickStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
      {/* Chart Header & Product Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Demand Forecast & Historical Velocity
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-[#ED1C24] border border-rose-200">
              {horizonDays}-Day Horizon
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
            {product.product_name}
          </h3>
          <p className="text-xs text-slate-500">
            SKU: <span className="font-mono font-semibold text-slate-700">{product.product_id}</span> • Category: <span className="font-semibold text-slate-700">{product.category}</span>
          </p>
        </div>

        {/* Product Dropdown Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="product-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Switch Product:
          </label>
          <select
            id="product-select"
            value={product.product_id}
            onChange={(e) => onSelectProduct(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            {allProducts.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_name} ({p.stockoutRisk} Risk)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 sm:h-80 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="uncertaintyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ED1C24" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ED1C24" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateTick}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const hist = payload.find((p) => p.dataKey === 'historical')?.value;
                const fore = payload.find((p) => p.dataKey === 'forecast')?.value;
                const itemData = chartData.find((d) => d.date === label);

                return (
                  <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-sm border border-slate-700">
                    <p className="font-semibold text-slate-300 border-b border-slate-700/80 pb-1">
                      Date: {label}
                    </p>
                    {hist !== undefined && hist !== null && (
                      <p className="flex items-center justify-between gap-4">
                        <span className="text-slate-400">Historical Sales:</span>
                        <span className="font-bold text-white">{hist} units</span>
                      </p>
                    )}
                    {fore !== undefined && fore !== null && (
                      <>
                        <p className="flex items-center justify-between gap-4">
                          <span className="text-rose-400 font-medium">Projected Demand:</span>
                          <span className="font-bold text-rose-300">{fore} units</span>
                        </p>
                        {itemData && itemData.lowerBound !== null && itemData.upperBound !== null && (
                          <p className="flex items-center justify-between gap-4 text-[10px] text-slate-400">
                            <span>Uncertainty Range:</span>
                            <span>{itemData.lowerBound} - {itemData.upperBound} units</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
            />
            {/* Shaded Upper Bound Area for Prediction Interval */}
            <Area
              type="monotone"
              dataKey="upperBound"
              name="Forecast Uncertainty Range"
              stroke="none"
              fill="url(#uncertaintyGradient)"
              isAnimationActive={false}
            />
            {/* Historical Sales Line */}
            <Line
              type="monotone"
              dataKey="historical"
              name="Historical Sales"
              stroke="#334155"
              strokeWidth={2.2}
              dot={{ r: 2.5, fill: '#334155' }}
              activeDot={{ r: 5 }}
            />
            {/* Forecast Demand Line */}
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast Demand"
              stroke="#ED1C24"
              strokeWidth={2.8}
              strokeDasharray="5 4"
              dot={{ r: 3, fill: '#ED1C24' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Forecasting Method & Limitations Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-slate-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#ED1C24] shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                Method: {product.forecastingMethod.name}
              </span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                product.forecastingMethod.confidenceLevel === 'High'
                  ? 'bg-emerald-100 text-emerald-800'
                  : product.forecastingMethod.confidenceLevel === 'Medium'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {product.forecastingMethod.confidenceLevel} Confidence
              </span>
              {product.forecastingMethod.backtestError && (
                <span className="text-[10px] text-slate-500 font-mono">
                  Holdout {product.forecastingMethod.backtestError.metric}: {product.forecastingMethod.backtestError.valuePercent}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {product.forecastingMethod.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{product.forecastingMethod.limitations}</span>
        </div>
      </div>
    </div>
  );
};
