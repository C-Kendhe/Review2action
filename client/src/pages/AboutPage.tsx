import React from 'react';
import {
  Cpu,
  ShieldCheck,
  Workflow
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-10 pb-12 max-w-5xl">
      {/* Title & Hackathon Banner */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#ED1C24] border border-rose-200/80 mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>AMD Hackathon Prototype • Architectural Blueprint</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          About Review2Action & SmartStock AI
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          A dual-engine e-commerce intelligence platform combining customer review sentiment synthesis with statistical demand forecasting and supply chain inventory replenishment.
        </p>
      </div>

      {/* System Architecture Diagram Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            End-to-End System Architecture
          </h2>
        </div>

        {/* Visual Architecture Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
              1
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Client Ingestion</h4>
            <p className="text-slate-600 leading-relaxed">
              React + Vite drag-and-drop file uploader with client-side type checks and sample previews.
            </p>
            <span className="inline-block text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">
              Multipart / CSV (10MB)
            </span>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
              2
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Clean & Normalize</h4>
            <p className="text-slate-600 leading-relaxed">
              Express + Papa Parse header normalization, duplicate elimination, and rating coercion.
            </p>
            <span className="inline-block text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">
              Zod & In-Memory Pipeline
            </span>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-[#ED1C24] text-white font-bold flex items-center justify-center text-[11px]">
              3
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Pluggable Analysis</h4>
            <p className="text-slate-600 leading-relaxed">
              Decoupled <code className="font-mono text-[#ED1C24]">AnalysisProvider</code> interface supporting Local Heuristics & AMD ROCm LLM.
            </p>
            <span className="inline-block text-[10px] font-mono bg-rose-100 text-[#ED1C24] px-1.5 py-0.5 rounded font-bold">
              Local Heuristic / AMD vLLM
            </span>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
              4
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Action Synthesizer</h4>
            <p className="text-slate-600 leading-relaxed">
              Generates executive KPIs, sentiment breakdown, Recharts graphs, and evidence-grounded actions.
            </p>
            <span className="inline-block text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">
              Executive Dashboard
            </span>
          </div>
        </div>
      </section>

      {/* AMD ROCm & Instinct MI300X Blueprint */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ED1C24] text-white flex items-center justify-center font-black text-xs">
            AMD
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              AMD ROCm™ & AMD Instinct™ MI300X Integration Blueprint
            </h2>
            <p className="text-xs text-slate-400">
              Zero code changes required on frontend. Plug-and-play inference configuration.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The backend analysis engine is deliberately decoupled from any single inference provider. While the default installation operates instantly offline with our deterministic heuristic engine, the codebase is engineered with an <code className="text-rose-400 font-mono">AmdLlmAnalysisProvider</code> that connects directly to an AMD ROCm-accelerated vLLM or TGI inference server.
        </p>

        {/* Configuration Code Block */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Backend Environment Configuration (<code className="text-white font-mono">server/.env</code>)
          </span>
          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
{`# Enable AMD ROCm LLM Provider
USE_AMD_LLM=true

# AMD Instinct Hosted vLLM / TGI Endpoint
AMD_LLM_ENDPOINT="http://rocm-inference.internal:8000/v1/chat/completions"

# Target Model (e.g. Meta-Llama-3-70B or Mixtral optimized for ROCm)
AMD_LLM_MODEL="meta-llama/Meta-Llama-3-70B-Instruct"

# Server-Side API Bearer Token (Never exposed to the browser client)
AMD_LLM_API_KEY="amd_rocm_token_secret"`}
          </pre>
        </div>

        {/* Comparison Table: Local Heuristics vs AMD Instinct LLM */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Local Heuristic Engine vs. AMD ROCm LLM Engine
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                  <th className="p-3">Capability</th>
                  <th className="p-3">Local Heuristic (Included Now)</th>
                  <th className="p-3 text-rose-400">AMD Instinct LLM (Pluggable)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr>
                  <td className="p-3 font-semibold text-white">Sentiment Classification</td>
                  <td className="p-3">Rating-weighted lexicon polarity & negation windows</td>
                  <td className="p-3 text-rose-300">Contextual nuances, subtle sarcasm & tone understanding</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Topic Discovery</td>
                  <td className="p-3">Predefined retail dictionary & regex keyword matching</td>
                  <td className="p-3 text-rose-300">Dynamic semantic clustering & emerging defect discovery</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Action Synthesis</td>
                  <td className="p-3">Deterministic evidence correlation by category</td>
                  <td className="p-3 text-rose-300">Generative executive action narratives with quantified ROI</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Compute Requirements</td>
                  <td className="p-3">Runs anywhere (browser or 100MB Node server)</td>
                  <td className="p-3 text-rose-300">Accelerated via AMD ROCm Instinct MI300X / MI250 GPUs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Security & Reliability */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Security, Privacy & Data Isolation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">In-Memory Session Storage</h4>
            <p>
              Uploaded CSV files are held strictly in temporary server memory and discarded automatically. No persistent tracking database is required.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">Zero Cloud Data Leakage</h4>
            <p>
              Unlike standard SaaS tools that pipe customer reviews to unvetted cloud APIs, Review2Action AI guarantees full data sovereignty within your environment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">Strict Rate Limiting & Protection</h4>
            <p>
              Backend API limits uploads to 10 MB and protects endpoints against denial-of-service with Express rate limiting and input sanitization.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
