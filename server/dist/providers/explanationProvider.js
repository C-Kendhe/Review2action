"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmExplanationProvider = exports.TemplateExplanationProvider = void 0;
/**
 * Deterministic, offline evidence-based explanation provider.
 * Uses exact computed values and never hallucinates numbers or citations.
 */
class TemplateExplanationProvider {
    name = 'TemplateExplanationProvider (Local Heuristic)';
    async generateExplanation(context) {
        const { product_name, forecast, inventory } = context;
        const name = product_name || context.product_id;
        const horizon = forecast.horizonDays;
        const demand = forecast.totalForecastDemand;
        const avgRate = forecast.averageDailyDemand;
        const stock = inventory.currentInventory;
        const leadTime = inventory.leadTimeDays;
        const stockoutDays = inventory.estimatedDaysUntilStockout;
        const reorderQty = inventory.suggestedReorderQuantity;
        const risk = inventory.stockoutRisk;
        if (risk === 'High') {
            if (stock !== null && stock <= 0) {
                return `URGENT: ${name} is completely out of stock. Projected demand over the next ${horizon} days is ${demand} units (${avgRate} units/day). Place an immediate replenishment order for at least ${reorderQty ?? demand} units to restore inventory.`;
            }
            if (leadTime !== null && stockoutDays !== null) {
                return `HIGH RISK: ${name} is at high stockout risk. Projected demand over the next ${horizon} days is ${demand} units (${avgRate} units/day) with current inventory at ${stock} units. At this velocity, stockout will occur in approximately ${stockoutDays} days, which is shorter than supplier lead time (${leadTime} days). Immediate purchase order required.`;
            }
            return `HIGH RISK: ${name} faces critical inventory depletion within the ${horizon}-day horizon (${demand} units forecast demand vs. ${stock ?? 0} units on hand). Expedited replenishment is strongly recommended.`;
        }
        if (risk === 'Medium') {
            if (stockoutDays !== null) {
                return `MEDIUM RISK: ${name} has ${stock} units remaining and is projected to sell ${demand} units over the next ${horizon} days. Stockout is estimated in ${stockoutDays} days. A reorder of ${reorderQty ?? 0} units should be queued soon to prevent disruption.`;
            }
            return `MEDIUM RISK: ${name} inventory (${stock ?? 'N/A'}) is approaching reorder threshold under a projected demand of ${demand} units over ${horizon} days. Replenishment planning recommended.`;
        }
        if (risk === 'Low') {
            const runwayStr = stockoutDays !== null ? `${stockoutDays} days` : `over ${horizon} days`;
            return `STABLE: ${name} inventory is in good standing. Current stock (${stock} units) provides an estimated runway of ${runwayStr}, comfortably exceeding the ${horizon}-day forecast demand of ${demand} units.`;
        }
        // Unknown Risk (e.g. missing stock or lead time)
        return `NOTICE: ${name} is forecasted to generate ${demand} units in demand over ${horizon} days (${avgRate} units/day). Inventory status or supplier lead time was not provided in the uploaded dataset, so stockout risk and reorder quantities cannot be computed.`;
    }
}
exports.TemplateExplanationProvider = TemplateExplanationProvider;
/**
 * AMD Token Factory OpenAI-Compatible LLM Explanation Adapter.
 * Connects to AMD Token Factory serving Qwen3.8-Flash-Next on AMD Instinct ROCm architecture.
 * Strictly constrained to computed inputs; validates JSON; falls back to template provider if offline.
 */
class LlmExplanationProvider {
    name = 'AMD Token Factory LLM Explanation Provider';
    templateFallback = new TemplateExplanationProvider();
    async generateExplanation(context) {
        const rawEndpoint = process.env.AMD_LLM_ENDPOINT?.trim();
        const apiKey = process.env.AMD_LLM_API_KEY?.trim();
        const model = process.env.AMD_LLM_MODEL?.trim() || 'Qwen3.8-Flash-Next';
        // If endpoint not configured, gracefully use deterministic template
        if (!rawEndpoint) {
            return this.templateFallback.generateExplanation(context);
        }
        // Normalize OpenAI-compatible endpoint URL
        const endpoint = rawEndpoint.endsWith('/chat/completions')
            ? rawEndpoint
            : `${rawEndpoint.replace(/\/+$/, '')}/chat/completions`;
        try {
            const payload = {
                model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert e-commerce supply chain analyst for Review2Action & SmartStock AI running on AMD Instinct ROCm architecture and AMD Token Factory. ' +
                            'Write a concise, 2-to-3 sentence executive explanation for the product inventory situation. ' +
                            'CRITICAL RULES: Do NOT invent, hallucinate, or alter any numbers. Use ONLY the supplied numbers. Return ONLY valid JSON in the format: {"explanation": "..."}.'
                    },
                    {
                        role: 'user',
                        content: JSON.stringify({
                            product_id: context.product_id,
                            product_name: context.product_name,
                            category: context.category,
                            current_inventory: context.inventory.currentInventory,
                            lead_time_days: context.inventory.leadTimeDays,
                            forecast_demand_units: context.forecast.totalForecastDemand,
                            horizon_days: context.forecast.horizonDays,
                            average_daily_demand: context.forecast.averageDailyDemand,
                            estimated_days_until_stockout: context.inventory.estimatedDaysUntilStockout,
                            stockout_risk: context.inventory.stockoutRisk,
                            reorder_point: context.inventory.reorderPoint,
                            suggested_reorder_qty: context.inventory.suggestedReorderQuantity
                        })
                    }
                ],
                temperature: 0.1,
                reasoning_effort: 'low',
                max_tokens: 1000,
                response_format: { type: 'json_object' }
            };
            const startTime = Date.now();
            const sanitizedEndpoint = rawEndpoint.split('?')[0];
            console.info(`[Explanation-AMD] Request started for product ${context.product_id} (${context.product_name}) via ${sanitizedEndpoint}...`);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 120000); // 120s timeout
            const headers = {
                'Content-Type': 'application/json'
            };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
            let res;
            try {
                res = await fetch(endpoint, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
            }
            finally {
                clearTimeout(timeout);
            }
            const elapsedMs = Date.now() - startTime;
            if (!res.ok) {
                console.warn(`[Explanation-AMD] HTTP ${res.status} returned after ${elapsedMs}ms. Falling back to deterministic template.`);
                return this.templateFallback.generateExplanation(context);
            }
            const data = await res.json();
            const rawText = data?.choices?.[0]?.message?.content || '';
            const cleanedText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            const parsed = JSON.parse(cleanedText);
            if (parsed && typeof parsed.explanation === 'string' && parsed.explanation.trim()) {
                console.info(`[Explanation-AMD] Succeeded in ${elapsedMs}ms (${(elapsedMs / 1000).toFixed(1)}s) for product ${context.product_id}.`);
                return parsed.explanation.trim();
            }
            console.warn(`[Explanation-AMD] Invalid schema returned after ${elapsedMs}ms. Falling back to template.`);
            return this.templateFallback.generateExplanation(context);
        }
        catch (err) {
            console.warn(`[Explanation-AMD] Inference call failed or timed out (${err?.message || 'unknown'}). Gracefully falling back to template.`);
            return this.templateFallback.generateExplanation(context);
        }
    }
}
exports.LlmExplanationProvider = LlmExplanationProvider;
