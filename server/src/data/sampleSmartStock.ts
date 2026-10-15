/**
 * Realistic synthetic sample dataset for SmartStock AI demonstration.
 * Covers 35 consecutive days across 5 products with distinct supply chain profiles:
 * 1. PROD-AURORA-01: Rising sales, low inventory (18), lead time 10d -> HIGH STOCKOUT RISK
 * 2. PROD-TITAN-02: Stable sales, high inventory (145), lead time 7d, safety stock 20 -> LOW RISK
 * 3. PROD-LUMEN-03: Falling sales, moderate inventory (28), lead time 14d -> MEDIUM RISK
 * 4. PROD-NEXUS-04: Price variation, missing inventory & lead time -> UNKNOWN RISK (Missing stock explained)
 * 5. PROD-SWIFT-05: High velocity, inventory (48), lead time 12d -> HIGH RISK
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

  // Base date: 35 days ending 2026-10-10
  const startDate = new Date('2026-09-06');
  const daysCount = 35;

  for (let day = 0; day < daysCount; day++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + day);
    const dateStr = curDate.toISOString().split('T')[0];
    const dow = curDate.getDay(); // 0 is Sunday, 6 is Saturday
    const weekendMultiplier = (dow === 0 || dow === 6) ? 1.4 : 1.0;

    // 1. PROD-AURORA-01: Rising trend (base 3 rising to 7), inventory starts 160 drops to 18
    const auroraTrend = 3 + Math.floor(day * 0.12);
    const auroraNoise = (day % 3 === 0 ? 1 : 0) - (day % 5 === 0 ? 1 : 0);
    const auroraUnits = Math.max(1, Math.round((auroraTrend + auroraNoise) * weekendMultiplier));
    const auroraInv = Math.max(18, 160 - day * 4);
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
        (day > 25 ? 'true' : 'false')
      ].join(',')
    );

    // 2. PROD-TITAN-02: Stable steady sales (~3-4 units/day), healthy inventory (145)
    const titanNoise = (day % 4 === 0 ? 1 : 0) - (day % 3 === 0 ? 1 : 0);
    const titanUnits = Math.max(1, Math.round((3.5 + titanNoise) * (dow === 5 ? 1.3 : 1.0)));
    const titanInv = Math.max(110, 180 - day);
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
    const lumenTrend = Math.max(1.5, 6.0 - day * 0.11);
    const lumenUnits = Math.max(1, Math.round(lumenTrend * weekendMultiplier));
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

    // 4. PROD-NEXUS-04: Price variation ($59.99 regular vs $44.99 promo), missing inventory level!
    const isPromo = day >= 14 && day <= 21;
    const nexusPrice = isPromo ? '44.99' : '59.99';
    const nexusUnits = isPromo
      ? Math.round((7 + (day % 3)) * weekendMultiplier)
      : Math.round((2.5 + (day % 2)) * weekendMultiplier);
    // Notice: inventory_level and lead_time_days are left empty to test honest missing-data handling!
    rows.push(
      [
        dateStr,
        'PROD-NEXUS-04',
        '"Nexus USB-C 8-in-1 Docking Station"',
        'Accessories',
        nexusUnits,
        nexusPrice,
        '', // empty inventory
        '', // empty lead time
        '', // empty safety stock
        isPromo ? 'true' : 'false'
      ].join(',')
    );

    // 5. PROD-SWIFT-05: High velocity sales (~7-12 units/day), inventory 46, lead time 12d
    const swiftUnits = Math.max(3, Math.round((8 + (day % 4) - (day % 3)) * weekendMultiplier));
    const swiftInv = Math.max(22, 120 - Math.round(day * 2.5));
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
  }

  return rows.join('\n');
}

export const SAMPLE_SMARTSTOCK_CSV = generateSampleCsv();
