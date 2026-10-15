import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  Lightbulb,
  Info,
  CheckCircle2,
  Layers,
  PackageCheck,
  TrendingUp
} from 'lucide-react';
import type { PageTab, AnalysisResult, SmartStockForecastResult } from '../types';

interface SidebarProps {
  currentTab: PageTab;
  setCurrentTab: (tab: PageTab) => void;
  analysisResult: AnalysisResult | null;
  smartStockResult?: SmartStockForecastResult | null;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  analysisResult,
  smartStockResult,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const navItems = [
    {
      id: 'dashboard' as PageTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'upload' as PageTab,
      label: 'Upload Reviews',
      icon: UploadCloud,
      badge: analysisResult ? 'Active' : null,
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'insights' as PageTab,
      label: 'Insights & Analytics',
      icon: BarChart3,
      badge: analysisResult ? `${analysisResult.cleaningSummary.validReviews}` : null,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'recommendations' as PageTab,
      label: 'Recommendations',
      icon: Lightbulb,
      badge: analysisResult ? `${analysisResult.recommendations.length}` : null,
      badgeColor: 'bg-rose-100 text-[#ED1C24] font-bold'
    },
    {
      id: 'smartstock' as PageTab,
      label: 'SmartStock AI',
      icon: PackageCheck,
      badge: smartStockResult
        ? (smartStockResult.kpis.highRiskProductsCount > 0 ? `${smartStockResult.kpis.highRiskProductsCount} At Risk` : 'Ready')
        : 'New',
      badgeColor: smartStockResult && smartStockResult.kpis.highRiskProductsCount > 0
        ? 'bg-rose-100 text-[#ED1C24] font-bold'
        : 'bg-emerald-100 text-emerald-800 font-semibold'
    },
    {
      id: 'about' as PageTab,
      label: 'About & Architecture',
      icon: Info,
      badge: null
    }
  ];

  const handleSelect = (tab: PageTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-20 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#ED1C24]' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Dataset Status Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Active Dataset
              </span>
              {analysisResult ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400">None</span>
              )}
            </div>

            {analysisResult ? (
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Valid Reviews:</span>
                  <span className="font-semibold text-slate-800">
                    {analysisResult.cleaningSummary.validReviews}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Rating:</span>
                  <span className="font-semibold text-slate-800">
                    {analysisResult.metrics.averageRating !== null
                      ? `${analysisResult.metrics.averageRating} / 5`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Top Topic:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[110px]" title={analysisResult.metrics.topTopic}>
                    {analysisResult.metrics.topTopic}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                No review CSV loaded yet.
              </p>
            )}

            {smartStockResult && (
              <div className="mt-3 pt-3 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                    SmartStock
                  </span>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">
                    {smartStockResult.kpis.totalProducts} Products
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">High Risk:</span>
                    <span className="font-bold text-[#ED1C24]">
                      {smartStockResult.kpis.highRiskProductsCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Horizon:</span>
                    <span className="font-medium text-slate-800">
                      {smartStockResult.horizonDays} Days
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AMD Architecture Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-[#ED1C24] flex items-center justify-center text-white text-[10px] font-black">
              AMD
            </div>
            <span className="text-xs font-bold text-slate-800">Inference Architecture</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Pluggable provider ready for AMD Instinct ROCm-accelerated LLM reasoning.
          </p>
        </div>
      </aside>
    </>
  );
};
