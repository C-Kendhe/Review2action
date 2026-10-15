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
 * Pluggable AMD ROCm / LLM Explanation Adapter.
 * Connects to an AMD Instinct MI300X / vLLM / OpenAI-compatible endpoint.
 * Strictly constrained to computed inputs; validates JSON; falls back to template provider if offline.
 */
class LlmExplanationProvider {
    name = 'AMD ROCm LLM Explanation Provider';
    templateFallback = new TemplateExplanationProvider();
    async generateExplanation(context) {
        const endpoint = process.env.AMD_LLM_ENDPOINT;
        const apiKey = process.env.AMD_LLM_API_KEY;
        const model = process.env.AMD_LLM_MODEL || 'meta-llama/Meta-Llama-3-70B-Instruct';
        // If endpoint not configured, gracefully use deterministic template
        if (!endpoint) {
            return this.templateFallback.generateExplanation(context);
        }
        try {
            const payload = {
                model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert e-commerce supply chain analyst for Review2Action & SmartStock AI running on AMD Instinct ROCm architecture. ' +
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
                max_tokens: 200,
                response_format: { type: 'json_object' }
            };
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!res.ok) {
                console.warn(`[SmartStock LLM] Inference endpoint returned HTTP ${res.status}. Falling back to template.`);
                return this.templateFallback.generateExplanation(context);
            }
            const data = await res.json();
            const rawText = data?.choices?.[0]?.message?.content || '';
            const parsed = JSON.parse(rawText);
            if (parsed && typeof parsed.explanation === 'string' && parsed.explanation.trim()) {
                return parsed.explanation.trim();
            }
            return this.templateFallback.generateExplanation(context);
        }
        catch (err) {
            console.warn('[SmartStock LLM] Inference call failed or timed out. Gracefully falling back to template.', err);
            return this.templateFallback.generateExplanation(context);
        }
    }
}
exports.LlmExplanationProvider = LlmExplanationProvider;
