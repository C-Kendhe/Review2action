import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { DashboardLanding } from './pages/DashboardLanding';
import { UploadPage } from './pages/UploadPage';
import { InsightsPage } from './pages/InsightsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { SmartStockPage } from './pages/SmartStockPage';
import { AboutPage } from './pages/AboutPage';
import { api } from './services/api';
import type { AnalysisResult, PageTab, SmartStockForecastResult } from './types';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<PageTab>('dashboard');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [smartStockResult, setSmartStockResult] = useState<SmartStockForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Processing...');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Notification Toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Load sample dataset directly
  const handleLoadSample = async () => {
    setIsLoading(true);
    setLoadingMessage('Loading & analyzing e-commerce sample reviews dataset...');
    try {
      const data = await api.fetchSampleAnalysis();
      setAnalysisResult(data);
      showToast(`Successfully loaded ${data.cleaningSummary.validReviews} sample customer reviews!`);
      setCurrentTab('insights');
    } catch (err: any) {
      showToast(err.message || 'Failed to load sample dataset', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-800'
                : 'bg-rose-900 text-white border-rose-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        analysisResult={analysisResult}
        onLoadSample={handleLoadSample}
        isLoading={isLoading}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          analysisResult={analysisResult}
          smartStockResult={smartStockResult}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-68 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {isLoading ? (
            <LoadingSkeleton message={loadingMessage} />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardLanding
                  analysisResult={analysisResult}
                  setCurrentTab={setCurrentTab}
                  onLoadSample={handleLoadSample}
                  isLoading={isLoading}
                />
              )}

              {currentTab === 'upload' && (
                <UploadPage
                  analysisResult={analysisResult}
                  setAnalysisResult={setAnalysisResult}
                  setCurrentTab={setCurrentTab}
                  onLoadSample={handleLoadSample}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              )}

              {currentTab === 'insights' && (
                <InsightsPage
                  analysisResult={analysisResult}
                  setCurrentTab={setCurrentTab}
                  onLoadSample={handleLoadSample}
                  isLoading={isLoading}
                />
              )}

              {currentTab === 'recommendations' && (
                <RecommendationsPage
                  analysisResult={analysisResult}
                  setCurrentTab={setCurrentTab}
                  onLoadSample={handleLoadSample}
                  isLoading={isLoading}
                />
              )}

              {currentTab === 'smartstock' && (
                <SmartStockPage
                  smartStockResult={smartStockResult}
                  setSmartStockResult={setSmartStockResult}
                  showToast={showToast}
                />
              )}

              {currentTab === 'about' && <AboutPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
