import React from 'react';
import {
  Cpu,
  ShieldCheck,
  Workflow,
  Server,
  Cloud,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-10 pb-12 max-w-5xl">
      {/* Title & Architecture Banner */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#ED1C24] border border-rose-200/80 mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>AMD Token Factory Hosted API Integration • System Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          About Review2Action & SmartStock AI
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          A dual-engine e-commerce intelligence platform combining customer review sentiment synthesis with statistical demand forecasting and supply chain inventory replenishment, accelerated by AMD Token Factory hosted LLM inference.
        </p>
      </div>

      {/* System Architecture Flow Visual */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            End-to-End System Architecture Flow
          </h2>
        </div>

        {/* Visual Architecture Flow: 5 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">React Frontend</h4>
              <p className="text-slate-600 leading-relaxed">
                React 19 + Vite dashboard with drag-and-drop CSV upload, 1-click sample data, and dynamic horizon toggles.
              </p>
            </div>
            <span className="inline-block text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded self-start">
              Client UI
            </span>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Express Backend</h4>
              <p className="text-slate-600 leading-relaxed">
                In-memory multipart ingestion (Multer), IP rate limiting, and Papa Parse schema validation with alias matching.
              </p>
            </div>
            <span className="inline-block text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded self-start">
              Node.js / Express
            </span>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Local Engine</h4>
              <p className="text-slate-600 leading-relaxed">
                Calculates review metrics & topics locally. Computes Holt-Winters demand forecasts and inventory KPIs deterministically.
              </p>
            </div>
            <span className="inline-block text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded self-start">
              Statistical Models
            </span>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-6 h-6 rounded-lg bg-[#ED1C24] text-white font-bold flex items-center justify-center text-[11px]">
                4
              </span>
              <h4 className="font-bold text-slate-900 text-sm">AMD Token Factory</h4>
              <p className="text-slate-600 leading-relaxed">
                Backend sends compact synthesized metrics and quotes to the hosted OpenAI-compatible completions API for strategic reasoning.
              </p>
            </div>
            <span className="inline-block text-[10px] font-mono bg-rose-100 text-[#ED1C24] px-1.5 py-0.5 rounded font-bold self-start">
              Hosted LLM API
            </span>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
                5
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Action Dashboard</h4>
              <p className="text-slate-600 leading-relaxed">
                Returns validated action cards, Recharts time-series projections, stockout risks, and product replenishment plans.
              </p>
            </div>
            <span className="inline-block text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded self-start">
              Visual Intelligence
            </span>
          </div>
        </div>

        {/* Architecture Flow Summary Line */}
        <div className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl text-xs flex flex-wrap items-center justify-center gap-2 font-medium">
          <span className="text-slate-400">Pipeline:</span>
          <span className="font-semibold text-white">React + Vite Frontend</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#ED1C24]" />
          <span className="font-semibold text-white">Express Backend</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#ED1C24]" />
          <span className="font-semibold text-white">Local Data Processing / Forecasting</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#ED1C24]" />
          <span className="font-semibold text-rose-300">AMD Token Factory API (On Demand)</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#ED1C24]" />
          <span className="font-semibold text-white">Frontend Visualizations</span>
        </div>
      </section>

      {/* AMD Token Factory Integration Details */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ED1C24] text-white flex items-center justify-center font-black text-xs">
            AMD
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              AMD Token Factory Hosted API Integration
            </h2>
            <p className="text-xs text-slate-400">
              Cloud-hosted LLM inference for executive recommendations and supply chain intelligence
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Our production deployment connects to <strong>AMD Token Factory</strong>, which provides hosted Large Language Model (LLM) inference through an OpenAI-compatible HTTP API. The application does not run or host local GPU instances; instead, our Express backend securely transmits inference requests to AMD Token Factory's hosted chat completions endpoint.
          </p>
          <p>
            The backend integrates model <code className="text-rose-400 font-mono font-bold">Qwen3.8-Flash-Next</code> hosted on AMD Token Factory. This hosted model is utilized specifically for high-level business synthesis—generating executive recommendations with assigned team ownership and on-demand SmartStock product replenishment narratives—while all mathematical calculations, statistical forecasting, and data validation are performed locally.
          </p>
        </div>

        {/* Real Backend Environment Configuration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Backend Environment Configuration (<code className="text-white font-mono">server/.env</code>)
            </span>
            <span className="text-[11px] text-rose-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Server-side only (never exposed to browser)
            </span>
          </div>
          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
{`# AMD Token Factory Hosted API Configuration
USE_AMD_LLM=true
AMD_LLM_ENDPOINT="https://api.tokenfactory.amd.com/v1"
AMD_LLM_MODEL="Qwen3.8-Flash-Next"

# Server-Side API Bearer Token
# Securely stored in backend environment; NEVER exposed in frontend code or client bundles
AMD_LLM_API_KEY="your-amd-token-factory-api-key"`}
          </pre>
        </div>

        {/* Division of Work & Fallback Mechanism */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ED1C24]" />
              Prompt Optimization & Efficiency
            </h4>
            <p className="text-slate-300 leading-relaxed">
              To eliminate token waste and guarantee zero mathematical hallucinations, raw CSV rows are never dumped directly into the LLM. Instead, the backend sends a concise, information-dense payload containing pre-computed metrics (total volume, negative percentage, top negative topic) and representative customer quote excerpts. The model focuses entirely on strategic reasoning and structured JSON synthesis.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              Automated Fallback Architecture
            </h4>
            <p className="text-slate-300 leading-relaxed">
              If AMD Token Factory credentials are not configured, or if an inference request encounters a timeout (120s abort controller), rate limit, or upstream outage, the backend automatically and seamlessly falls back to the built-in deterministic heuristic engine. The application never crashes or leaves the user stranded; results are tagged with <code className="text-rose-300 font-mono">isFallbackOrLocal: true</code> and a clear explanatory note.
            </p>
          </div>
        </div>

        {/* Future Integrations Clarification */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-white">
            <Cloud className="w-4 h-4 text-slate-400" />
            <span>Relationship to Future AMD Ecosystem Options</span>
          </div>
          <p className="leading-relaxed">
            While our active application connects to AMD Token Factory's hosted API, the decoupled <code className="text-white font-mono">AnalysisProvider</code> and <code className="text-white font-mono">ExplanationProvider</code> interfaces are engineered to easily accommodate optional future self-hosted deployments. In the future, teams could target self-managed AMD Instinct™ MI300X/MI250 hardware, AMD Developer Cloud instances, or vLLM/TGI clusters simply by swapping the endpoint URL. These remain optional architectural extensions and are not currently deployed.
          </p>
        </div>
      </section>

      {/* Comparison Table: Local Processing vs AMD Token Factory */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Workload Division: Local Processing vs. AMD Token Factory LLM
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear separation between deterministic computational tasks and cloud LLM reasoning
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                <th className="p-3">Platform Capability</th>
                <th className="p-3">Local Application Processing</th>
                <th className="p-3 text-[#ED1C24]">AMD Token Factory Hosted API</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="p-3 font-semibold text-slate-900">CSV Ingestion & Validation</td>
                <td className="p-3">Papa Parse header alias matching, Zod normalization, row deduplication</td>
                <td className="p-3 text-slate-400">Not used (handled 100% locally)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Sentiment & Star Analytics</td>
                <td className="p-3">Deterministic polarity scoring, rating distributions, net sentiment math</td>
                <td className="p-3 text-slate-400">Not used (avoids token waste)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Demand Forecasting (SmartStock)</td>
                <td className="p-3">Holt-Winters double exponential smoothing with day-of-week seasonality (7/14/30d)</td>
                <td className="p-3 text-slate-400">Not used (computed via local time-series math)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Inventory & Reorder Planning</td>
                <td className="p-3">Reorder Point (ROP), lead-time demand, buffer safety stock, stockout runway</td>
                <td className="p-3 text-slate-400">Not used (computed via deterministic formulas)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Strategic Recommendations</td>
                <td className="p-3">Rule-based category fallbacks if API is unavailable or offline</td>
                <td className="p-3 text-rose-600 font-medium">Qwen3.8-Flash-Next synthesizes executive actions & team owners</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Product Supply Chain Explanations</td>
                <td className="p-3">Evidence-based template explanations generated instantaneously</td>
                <td className="p-3 text-rose-600 font-medium">On-demand LLM explanations grounded strictly in computed metrics</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Security, Privacy & Data Handling */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Security, Privacy & Responsible Data Handling
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <Lock className="w-4 h-4 text-[#ED1C24]" />
              <h4>Server-Side Credential Storage</h4>
            </div>
            <p className="leading-relaxed">
              The AMD Token Factory API key (<code className="font-mono text-slate-800">AMD_LLM_API_KEY</code>) is stored exclusively in server environment variables. It is never transmitted to the browser client, compiled into frontend JavaScript bundles, or logged.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <Server className="w-4 h-4 text-emerald-600" />
              <h4>In-Memory File Processing</h4>
            </div>
            <p className="leading-relaxed">
              Uploaded CSV spreadsheets are handled strictly in transient server memory using Multer memory storage. Files are parsed, analyzed in-memory, and released immediately without persistent storage on disk or external databases.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <h4>Controlled Inference Scope</h4>
            </div>
            <p className="leading-relaxed">
              When LLM inference is enabled, raw CSV files are not passed to AMD Token Factory. Only high-level aggregated metrics and up to three anonymized customer excerpts are included in the prompt. Rate limiting (60 requests/15min) protects server endpoints.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
