"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
class InventoryService {
    /**
     * Calculates transparent inventory replenishment metrics for a product.
     */
    static calculateInventoryMetrics(productRows, forecast) {
        // 1. Extract latest metadata from historical rows
        const latestRowWithInv = [...productRows].reverse().find((r) => r.inventory_level !== undefined);
        const latestRowWithLead = [...productRows].reverse().find((r) => r.lead_time_days !== undefined);
        const latestRowWithSafety = [...productRows].reverse().find((r) => r.safety_stock !== undefined);
        const currentInventory = latestRowWithInv?.inventory_level ?? null;
        const leadTimeDays = latestRowWithLead?.lead_time_days ?? null;
        const providedSafetyStock = latestRowWithSafety?.safety_stock ?? null;
        const avgDailyDemand = forecast.averageDailyDemand;
        const totalForecastDemand = forecast.totalForecastDemand;
        const horizonDays = forecast.horizonDays;
        // Safety stock: use provided, or calculate standard rule-of-thumb (2 days of demand) if lead time is known
        let effectiveSafetyStock = 0;
        let safetyStockAssumption = 'No safety stock specified in dataset.';
        if (providedSafetyStock !== null) {
            effectiveSafetyStock = providedSafetyStock;
            safetyStockAssumption = `Using explicit safety stock value: ${effectiveSafetyStock} units.`;
        }
        else if (leadTimeDays !== null && avgDailyDemand > 0) {
            // Statistical heuristic buffer: 1.65 * sqrt(leadTime) * (0.35 * avgDailyDemand)
            effectiveSafetyStock = Math.max(2, Math.round(1.65 * Math.sqrt(leadTimeDays) * Math.max(1, avgDailyDemand * 0.35)));
            safetyStockAssumption = `Calculated buffer safety stock of ${effectiveSafetyStock} units based on lead time (${leadTimeDays}d) and demand variance.`;
        }
        // 2. Days until stockout
        let estimatedDaysUntilStockout = null;
        let daysUntilStockoutReason;
        if (currentInventory === null) {
            daysUntilStockoutReason = 'Current inventory level not provided in uploaded CSV.';
        }
        else if (currentInventory <= 0) {
            estimatedDaysUntilStockout = 0;
            daysUntilStockoutReason = 'Current inventory is 0 (stockout has already occurred).';
        }
        else if (avgDailyDemand <= 0) {
            daysUntilStockoutReason = 'Forecast demand is zero; stock will not deplete.';
        }
        else {
            estimatedDaysUntilStockout = Math.round((currentInventory / avgDailyDemand) * 10) / 10;
        }
        // 3. Demand during lead time
        let demandDuringLeadTime = null;
        if (leadTimeDays !== null) {
            demandDuringLeadTime = Math.round(avgDailyDemand * leadTimeDays * 10) / 10;
        }
        // 4. Reorder Point (ROP = Demand During Lead Time + Safety Stock)
        let reorderPoint = null;
        let reorderPointReason;
        if (leadTimeDays === null) {
            reorderPointReason = 'Supplier lead time (lead_time_days) not specified in CSV.';
        }
        else {
            reorderPoint = Math.round((demandDuringLeadTime || 0) + effectiveSafetyStock);
        }
        // 5. Suggested Reorder Quantity
        // Order-Up-To Level = Forecast Demand over Horizon + Safety Stock - Current Inventory
        let suggestedReorderQuantity = null;
        let suggestedReorderReason;
        if (currentInventory === null) {
            suggestedReorderReason = 'Cannot determine replenishment quantity without known on-hand inventory.';
        }
        else {
            const targetStockLevel = totalForecastDemand + effectiveSafetyStock;
            const deficit = targetStockLevel - currentInventory;
            suggestedReorderQuantity = Math.max(0, Math.ceil(deficit));
        }
        // 6. Stockout Risk Determination
        let stockoutRisk = 'Low';
        let riskReason = '';
        if (currentInventory === null) {
            stockoutRisk = 'Unknown';
            riskReason = 'Inventory level was not provided in the CSV; stockout risk cannot be determined.';
        }
        else if (currentInventory <= 0) {
            stockoutRisk = 'High';
            riskReason = 'Product is currently completely out of stock.';
        }
        else if (leadTimeDays !== null &&
            estimatedDaysUntilStockout !== null &&
            estimatedDaysUntilStockout <= leadTimeDays) {
            stockoutRisk = 'High';
            riskReason = `Stockout expected in ${estimatedDaysUntilStockout} days, which is less than supplier lead time (${leadTimeDays} days). Immediate replenishment required.`;
        }
        else if (reorderPoint !== null && currentInventory <= reorderPoint) {
            stockoutRisk = 'Medium';
            riskReason = `Current inventory (${currentInventory} units) is below or at reorder point (${reorderPoint} units).`;
        }
        else if (estimatedDaysUntilStockout !== null && estimatedDaysUntilStockout <= horizonDays) {
            stockoutRisk = 'Medium';
            riskReason = `Stock will run out in ${estimatedDaysUntilStockout} days (within the ${horizonDays}-day planning horizon).`;
        }
        else {
            stockoutRisk = 'Low';
            const runwayStr = estimatedDaysUntilStockout !== null ? `${estimatedDaysUntilStockout} days` : `>${horizonDays} days`;
            riskReason = `Healthy inventory runway (${runwayStr}) safely exceeding lead time and buffer requirements.`;
        }
        // 7. Transparent Calculation Details
        const calculationDetails = {
            avgDailyDemandFormula: `Total Forecast Demand (${totalForecastDemand} units) ÷ Horizon (${horizonDays} days) = ${avgDailyDemand} units/day`,
            demandDuringLeadTime,
            reorderPointFormula: leadTimeDays !== null
                ? `(Avg Daily Demand ${avgDailyDemand} × Lead Time ${leadTimeDays}d) + Safety Stock ${effectiveSafetyStock} = ${reorderPoint} units`
                : 'Lead time unknown; Reorder Point cannot be calculated',
            suggestedReorderFormula: currentInventory !== null
                ? `Max(0, (Forecast Demand ${totalForecastDemand} + Safety Stock ${effectiveSafetyStock}) - Current Inv ${currentInventory}) = ${suggestedReorderQuantity} units`
                : 'Current inventory unknown; replenishment quantity cannot be calculated',
            safetyStockUsed: effectiveSafetyStock,
            assumptions: [
                `Forecast planning horizon: ${horizonDays} days.`,
                `Average sales rate: ${avgDailyDemand} units/day based on statistical projection.`,
                safetyStockAssumption,
                leadTimeDays !== null
                    ? `Supplier delivery lead time: ${leadTimeDays} days.`
                    : 'Lead time not specified; stockout risk defaults to horizon threshold.'
            ]
        };
        return {
            currentInventory,
            leadTimeDays,
            safetyStock: providedSafetyStock !== null ? providedSafetyStock : effectiveSafetyStock,
            estimatedDaysUntilStockout,
            daysUntilStockoutReason,
            reorderPoint,
            reorderPointReason,
            suggestedReorderQuantity,
            suggestedReorderReason,
            stockoutRisk,
            riskReason,
            calculationDetails
        };
    }
}
exports.InventoryService = InventoryService;
