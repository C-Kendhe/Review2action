import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { SAMPLE_SMARTSTOCK_CSV } from '../data/sampleSmartStock.js';
import { SmartStockValidationService } from '../services/smartStockValidationService.js';
import { smartStockService } from '../services/smartStockService.js';
import smartStockRoutes from '../routes/smartStockRoutes.js';

test('SmartStock Sample CSV Schema & Content Verification', async (t) => {
  await t.test('Sample CSV is non-empty and contains required headers', () => {
    assert.ok(SAMPLE_SMARTSTOCK_CSV.length > 0, 'Sample CSV should not be empty');
    const firstLine = SAMPLE_SMARTSTOCK_CSV.split('\n')[0];
    const headers = firstLine.split(',').map((h) => h.trim());

    assert.ok(headers.includes('date'), 'Must contain date column');
    assert.ok(headers.includes('product_id'), 'Must contain product_id column');
    assert.ok(headers.includes('units_sold'), 'Must contain units_sold column');
  });

  await t.test('Validation service normalizes sample CSV with 0 invalid rows', () => {
    const { rows, summary } = SmartStockValidationService.validateAndNormalize(SAMPLE_SMARTSTOCK_CSV);

    assert.ok(rows.length > 0, 'Should extract normalized rows');
    assert.equal(summary.invalidRowsCount, 0, 'There should be 0 invalid rows in verified sample data');
    assert.ok(summary.dateRange, 'summary.dateRange should not be null');
    assert.ok(summary.dateRange.totalDays >= 90, `Date range should be at least 90 days, got ${summary.dateRange.totalDays}`);
    assert.ok(summary.productsFound.length >= 4 && summary.productsFound.length <= 6, `Should have 4-6 products, found ${summary.productsFound.length}`);

    // Verify non-negative integer units sold and valid date formats
    for (const row of rows) {
      assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/, `Date should be YYYY-MM-DD: ${row.date}`);
      assert.ok(row.units_sold >= 0, `units_sold must be non-negative: ${row.units_sold}`);
      assert.ok(Number.isInteger(row.units_sold), `units_sold should be integer: ${row.units_sold}`);
      assert.ok(row.product_id.trim().length > 0, 'product_id should not be empty');
    }
  });

  await t.test('Sample CSV handles missing optional fields gracefully', () => {
    const { rows } = SmartStockValidationService.validateAndNormalize(SAMPLE_SMARTSTOCK_CSV);
    const nexusRows = rows.filter((r) => r.product_id === 'PROD-NEXUS-04');
    assert.ok(nexusRows.length > 0, 'PROD-NEXUS-04 should exist');
    // Inventory and lead time should be undefined for Nexus to test missing data
    assert.equal(nexusRows[0].inventory_level, undefined, 'PROD-NEXUS-04 inventory should be undefined');
    assert.equal(nexusRows[0].lead_time_days, undefined, 'PROD-NEXUS-04 lead time should be undefined');
  });
});

test('SmartStock Forecasting Across Horizons', async (t) => {
  const horizons = [7, 14, 30] as const;

  for (const horizon of horizons) {
    await t.test(`Forecast succeeds for ${horizon}-day horizon`, async () => {
      const result = await smartStockService.analyzeAndForecast(SAMPLE_SMARTSTOCK_CSV, {
        horizonDays: horizon
      });

      assert.ok(result, 'Result should be defined');
      assert.equal(result.horizonDays, horizon, `Horizon should match ${horizon}`);
      assert.equal(result.kpis.totalProducts, 6, 'Should forecast 6 products');
      assert.ok(result.kpis.totalForecastDemandAllProducts > 0, 'Total demand should be greater than 0');

      // Verify product forecasting integrity
      for (const prod of result.products) {
        assert.equal(prod.horizonDays, horizon, `Product horizon should be ${horizon}`);
        assert.ok(prod.timeSeries.length > 0, 'Time series should have points');
        const futurePoints = prod.timeSeries.filter((p) => p.forecastUnits !== null);
        assert.equal(futurePoints.length, horizon, `Should have exactly ${horizon} future forecast points`);
      }

      // Check risk distribution: Aurora & Swift should be High Risk, Titan should be Low Risk, Nexus should be Unknown
      const aurora = result.products.find((p) => p.product_id === 'PROD-AURORA-01');
      const titan = result.products.find((p) => p.product_id === 'PROD-TITAN-02');
      const nexus = result.products.find((p) => p.product_id === 'PROD-NEXUS-04');

      assert.ok(aurora, 'PROD-AURORA-01 should exist in results');
      assert.equal(aurora.stockoutRisk, 'High', 'Aurora should have High stockout risk');

      assert.ok(titan, 'PROD-TITAN-02 should exist in results');
      assert.equal(titan.stockoutRisk, 'Low', 'Titan should have Low stockout risk');

      assert.ok(nexus, 'PROD-NEXUS-04 should exist in results');
      assert.equal(nexus.stockoutRisk, 'Unknown', 'Nexus should have Unknown stockout risk due to missing inventory');
    });
  }
});

test('SmartStock Express HTTP Endpoints', async (t) => {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api/smartstock', smartStockRoutes);

  let server: Server;
  let baseUrl: string;

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });

  t.after(() => {
    server.close();
  });

  await t.test('GET /api/smartstock/sample-csv serves downloadable CSV', async () => {
    const res = await fetch(`${baseUrl}/api/smartstock/sample-csv`);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('content-type')?.includes('text/csv'));
    assert.ok(res.headers.get('content-disposition')?.includes('attachment; filename="smartstock_sample_inventory.csv"'));
    const csv = await res.text();
    assert.ok(csv.startsWith('date,product_id,product_name'));
    assert.ok(csv.includes('PROD-AURORA-01'));
  });

  await t.test('GET /api/smartstock/sample-data returns forecast JSON with default 14 days', async () => {
    const res = await fetch(`${baseUrl}/api/smartstock/sample-data`);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('content-type')?.includes('application/json'));
    const body: any = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.horizonDays, 14);
    assert.equal(body.data.kpis.totalProducts, 6);
  });

  await t.test('GET /api/smartstock/sample-data?horizonDays=30 honors query param', async () => {
    const res = await fetch(`${baseUrl}/api/smartstock/sample-data?horizonDays=30`);
    assert.equal(res.status, 200);
    const body: any = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.horizonDays, 30);
  });

  await t.test('GET /api/smartstock/sample-forecast returns forecast JSON (alias endpoint)', async () => {
    const res = await fetch(`${baseUrl}/api/smartstock/sample-forecast?horizonDays=7`);
    assert.equal(res.status, 200);
    const body: any = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.horizonDays, 7);
    assert.equal(body.data.kpis.totalProducts, 6);
  });

  await t.test('POST /api/smartstock/forecast processes raw CSV content', async () => {
    const res = await fetch(`${baseUrl}/api/smartstock/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csvContent: SAMPLE_SMARTSTOCK_CSV,
        horizonDays: 14
      })
    });
    assert.equal(res.status, 200);
    const body: any = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.kpis.totalProducts, 6);
    assert.equal(body.data.horizonDays, 14);
  });
});
