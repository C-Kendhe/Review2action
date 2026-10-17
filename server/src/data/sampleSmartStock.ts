/**
 * Realistic synthetic sample dataset for SmartStock AI demonstration.
 * Covers 92 consecutive days (July 11, 2026 to October 10, 2026) across 6 products
 * with distinct supply chain profiles, weekday/weekend effects, and modest trends:
 * 
 * 1. PROD-AURORA-01: Upward trend (3 -> 8 units/day), inventory depleted to 18, lead time 10d -> HIGH STOCKOUT RISK
 * 2. PROD-TITAN-02: Stable demand (~3-5 units/day), healthy inventory (145), lead time 7d, safety stock 20 -> LOW RISK
 * 3. PROD-LUMEN-03: Decreasing trend (~6 -> 2 units/day), moderate inventory (28), lead time 14d -> MEDIUM RISK
 * 4. PROD-NEXUS-04: Promotional price variations, missing inventory level & lead time -> UNKNOWN RISK (tests missing data handling)
 * 5. PROD-SWIFT-05: High velocity (~8-14 units/day), inventory 42, lead time 12d, safety stock 25 -> HIGH RISK
 * 6. PROD-VERTEX-06: Moderate steady velocity (~2-4 units/day), healthy inventory (75), lead time 15d -> LOW RISK
 */

function generateSampleCsv(): string {
  const headers = [
    'date',
    'product_id',
    'product_name',
    'category',
    'units_sold',
    'price',
    'inventory_level',
    'lead_time_days',
    'safety_stock',
    'promotion'
  ];

  const rows: string[] = [headers.join(',')];

  // Base date: 92 days ending 2026-10-10 (2026-07-11 to 2026-10-10 inclusive)
  const startDate = new Date('2026-07-11');
  const daysCount = 92;

  for (let day = 0; day < daysCount; day++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + day);
    const dateStr = curDate.toISOString().split('T')[0];
    const dow = curDate.getDay(); // 0 is Sunday, 6 is Saturday
    const weekendMultiplier = (dow === 0 || dow === 6) ? 1.35 : 1.0;

    // 1. PROD-AURORA-01: Rising trend (base 3 rising to 8), inventory starts 450 drops to 18
    const auroraTrend = 3.0 + (day / 91) * 5.0;
    const auroraCycle = Math.sin((day / 91) * Math.PI * 4) * 0.8;
    const auroraPromo = day >= 70 && day <= 80;
    const auroraPromoBoost = auroraPromo ? 2.0 : 0.0;
    const auroraUnits = Math.max(1, Math.round((auroraTrend + auroraCycle + auroraPromoBoost) * weekendMultiplier));
    const auroraInv = Math.max(18, Math.round(450 - day * 4.7));
    rows.push(
      [
        dateStr,
        'PROD-AURORA-01',
        '"Aurora Wireless Noise-Cancelling Headphones"',
        'Audio',
        auroraUnits,
        '149.99',
        auroraInv,
        '10',
        '15',
        auroraPromo ? 'true' : 'false'
      ].join(',')
    );

    // 2. PROD-TITAN-02: Stable steady sales (~3-5 units/day), healthy inventory (145)
    const titanVariance = Math.cos((day / 91) * Math.PI * 6) * 0.7 + ((day % 4 === 0 ? 1 : 0) - (day % 3 === 0 ? 1 : 0));
    const titanWeekend = (dow === 5 || dow === 6) ? 1.25 : 1.0;
    const titanUnits = Math.max(1, Math.round((3.5 + titanVariance) * titanWeekend));
    const titanInv = Math.max(145, 240 - day);
    rows.push(
      [
        dateStr,
        'PROD-TITAN-02',
        '"Titan Mechanical Gaming Keyboard"',
        'Peripherals',
        titanUnits,
        '89.99',
        titanInv,
        '7',
        '20',
        'false'
      ].join(',')
    );

    // 3. PROD-LUMEN-03: Falling sales (6 units down to 2), inventory 28, lead time 14d
    const lumenTrend = 5.8 - (day / 91) * 3.6;
    const lumenCycle = Math.sin((day / 91) * Math.PI * 2) * 0.5;
    const lumenUnits = Math.max(1, Math.round((lumenTrend + lumenCycle) * ((dow === 0 || dow === 6) ? 1.3 : 1.0)));
    rows.push(
      [
        dateStr,
        'PROD-LUMEN-03',
        '"Lumen Ultra-Wide 4K Gaming Monitor"',
        'Displays',
        lumenUnits,
        '399.99',
        '28',
        '14',
        '8',
        'false'
      ].join(',')
    );

    // 4. PROD-NEXUS-04: Price variation ($59.99 regular vs $44.99 promo), intentionally missing inventory & lead time
    const isNexusPromo = (day >= 25 && day <= 35) || (day >= 72 && day <= 82);
    const nexusPrice = isNexusPromo ? '44.99' : '59.99';
    const nexusUnits = isNexusPromo
      ? Math.max(3, Math.round((7.5 + ((day % 3) * 1.2)) * ((dow === 0 || dow === 6) ? 1.2 : 1.0)))
      : Math.max(1, Math.round((2.8 + ((day % 5) * 0.3)) * ((dow === 0 || dow === 6) ? 1.2 : 1.0)));
    rows.push(
      [
        dateStr,
        'PROD-NEXUS-04',
        '"Nexus USB-C 8-in-1 Docking Station"',
        'Accessories',
        nexusUnits,
        nexusPrice,
        '', // intentionally empty inventory
        '', // intentionally empty lead time
        '', // intentionally empty safety stock
        isNexusPromo ? 'true' : 'false'
      ].join(',')
    );

    // 5. PROD-SWIFT-05: High velocity sales (~8-14 units/day), inventory 42, lead time 12d
    const swiftCycle = Math.sin((day / 91) * Math.PI * 8) * 2.0;
    const swiftJitter = (day % 6 === 0 ? 1.5 : 0) - (day % 4 === 0 ? 1 : 0);
    const swiftUnits = Math.max(3, Math.round((9.0 + swiftCycle + swiftJitter) * weekendMultiplier));
    const swiftInv = Math.max(42, Math.round(280 - day * 2.6));
    rows.push(
      [
        dateStr,
        'PROD-SWIFT-05',
        '"Swift Pro Wireless Precision Mouse"',
        'Peripherals',
        swiftUnits,
        '69.99',
        swiftInv,
        '12',
        '25',
        'false'
      ].join(',')
    );

    // 6. PROD-VERTEX-06: Steady medium-volume demand (~2-4 units/day), healthy inventory 75, lead time 15d
    const vertexWeekday = (dow === 1 || dow === 2) ? 1.2 : 1.0;
    const vertexCycle = Math.cos((day / 91) * Math.PI * 4) * 0.4;
    const vertexUnits = Math.max(1, Math.round((2.5 + vertexCycle) * vertexWeekday));
    const vertexInv = Math.max(75, Math.round(120 - day * 0.5));
    rows.push(
      [
        dateStr,
        'PROD-VERTEX-06',
        '"Vertex Ergonomic Mesh Desk Chair"',
        'Furniture',
        vertexUnits,
        '279.99',
        vertexInv,
        '15',
        '12',
        'false'
      ].join(',')
    );
  }

  return rows.join('\n');
}

export const SAMPLE_SMARTSTOCK_CSV = generateSampleCsv();
