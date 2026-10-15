import Papa from 'papaparse';
import {
  RawSmartStockRow,
  NormalizedSmartStockRow,
  SmartStockValidationSummary,
  InvalidRowDetail,
  ProductSummaryInUpload
} from '../types/smartStock.js';

const HEADER_ALIASES: Record<string, string[]> = {
  date: ['date', 'timestamp', 'order_date', 'day', 'sales_date', 'trans_date', 'record_date'],
  product_id: ['product_id', 'product', 'sku', 'item_id', 'item', 'product_code', 'id'],
  units_sold: ['units_sold', 'sales', 'quantity_sold', 'units', 'quantity', 'qty', 'volume', 'qty_sold', 'units_ordered'],
  product_name: ['product_name', 'product_title', 'name', 'item_name', 'title', 'description', 'product_desc'],
  price: ['price', 'unit_price', 'product_price', 'amount', 'cost', 'selling_price'],
  inventory_level: ['inventory_level', 'stock', 'stock_level', 'inventory', 'current_stock', 'on_hand', 'units_in_stock'],
  promotion: ['promotion', 'promo', 'on_promotion', 'is_promo', 'discount', 'promoted'],
  category: ['category', 'department', 'product_category', 'type', 'segment', 'genre'],
  lead_time_days: ['lead_time_days', 'lead_time', 'supplier_lead_time', 'lead_days', 'replenishment_time', 'delivery_days'],
  safety_stock: ['safety_stock', 'buffer_stock', 'minimum_stock', 'min_stock', 'safety_level']
};

export class SmartStockValidationService {
  /**
   * Cleans, normalizes, and validates SmartStock CSV content.
   */
  public static validateAndNormalize(
    csvString: string,
    maxRows = 15000
  ): {
    rows: NormalizedSmartStockRow[];
    summary: SmartStockValidationSummary;
  } {
    if (!csvString || csvString.trim().length === 0) {
      throw new Error('EMPTY_FILE: The uploaded CSV file is empty. Please provide historical sales and inventory data.');
    }

    const parseResult = Papa.parse<RawSmartStockRow>(csvString, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim().toLowerCase().replace(/[\s\-_]+/g, '_')
    });

    const detectedHeaders = parseResult.meta.fields || [];
    const headerMapping = this.detectHeaderMapping(detectedHeaders);

    // Required columns validation
    const missingRequired: string[] = [];
    if (!headerMapping.date) missingRequired.push('date (aliases: order_date, timestamp, day)');
    if (!headerMapping.product_id) missingRequired.push('product_id (aliases: sku, item_id, product)');
    if (!headerMapping.units_sold) missingRequired.push('units_sold (aliases: sales, quantity_sold, units, qty)');

    if (missingRequired.length > 0) {
      const detectedStr = detectedHeaders.length > 0 ? detectedHeaders.join(', ') : 'None';
      throw new Error(
        `INVALID_CSV_HEADERS: Missing required columns: [${missingRequired.join('; ')}]. ` +
        `Detected headers: [${detectedStr}]. ` +
        `Please ensure your CSV has headers for date, product_id, and units_sold.`
      );
    }

    const rawRows = parseResult.data || [];
    if (rawRows.length === 0) {
      throw new Error('EMPTY_DATA: The CSV has header row(s) but no data rows were found.');
    }

    if (rawRows.length > maxRows) {
      throw new Error(`FILE_TOO_LARGE: File exceeds maximum allowed rows (${maxRows.toLocaleString()}). Uploaded ${rawRows.length.toLocaleString()} rows.`);
    }

    const validRows: NormalizedSmartStockRow[] = [];
    const invalidRows: InvalidRowDetail[] = [];
    const rowKeysSeen = new Map<string, number>(); // key -> index in validRows
    let duplicateRowsCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const raw = rawRows[i];
      const rowNum = i + 2; // +2 to account for 1-indexed line and header row

      // 1. Extract product_id
      const rawProductId = headerMapping.product_id ? raw[headerMapping.product_id] : undefined;
      const productId = rawProductId ? String(rawProductId).trim() : '';
      if (!productId) {
        invalidRows.push({
          rowNumber: rowNum,
          reason: 'Missing or empty product_id',
          sampleData: JSON.stringify(raw)
        });
        continue;
      }

      // 2. Extract & validate date
      const rawDate = headerMapping.date ? raw[headerMapping.date] : undefined;
      const normalizedDate = this.parseDateSafely(rawDate);
      if (!normalizedDate) {
        invalidRows.push({
          rowNumber: rowNum,
          reason: `Invalid or unparseable date value: "${rawDate || ''}"`,
          sampleData: `product_id: ${productId}`
        });
        continue;
      }

      // 3. Extract & validate units_sold
      const rawUnits = headerMapping.units_sold ? raw[headerMapping.units_sold] : undefined;
      const cleanUnitsStr = String(rawUnits || '').replace(/[$,]/g, '').trim();
      const unitsSold = parseFloat(cleanUnitsStr);
      if (isNaN(unitsSold) || unitsSold < 0) {
        invalidRows.push({
          rowNumber: rowNum,
          reason: `Invalid units_sold value: "${rawUnits || ''}". Must be a non-negative number.`,
          sampleData: `product_id: ${productId}, date: ${normalizedDate}`
        });
        continue;
      }

      // 4. Extract optional fields
      let productName: string | undefined;
      if (headerMapping.product_name && raw[headerMapping.product_name]) {
        const val = String(raw[headerMapping.product_name]).trim();
        if (val) productName = val;
      }

      let price: number | undefined;
      if (headerMapping.price && raw[headerMapping.price]) {
        const p = parseFloat(String(raw[headerMapping.price]).replace(/[$,]/g, '').trim());
        if (!isNaN(p) && p >= 0) price = p;
      }

      let inventoryLevel: number | undefined;
      if (headerMapping.inventory_level && raw[headerMapping.inventory_level] !== undefined && raw[headerMapping.inventory_level] !== '') {
        const inv = parseFloat(String(raw[headerMapping.inventory_level]).replace(/[$,]/g, '').trim());
        if (!isNaN(inv) && inv >= 0) inventoryLevel = Math.round(inv);
      }

      let promotion: boolean | undefined;
      if (headerMapping.promotion && raw[headerMapping.promotion] !== undefined) {
        const promoStr = String(raw[headerMapping.promotion]).toLowerCase().trim();
        if (['1', 'true', 'yes', 'y', 'promo'].includes(promoStr)) promotion = true;
        else if (['0', 'false', 'no', 'n', ''].includes(promoStr)) promotion = false;
      }

      let category: string | undefined;
      if (headerMapping.category && raw[headerMapping.category]) {
        const c = String(raw[headerMapping.category]).trim();
        if (c) category = c;
      }

      let leadTimeDays: number | undefined;
      if (headerMapping.lead_time_days && raw[headerMapping.lead_time_days]) {
        const lt = parseFloat(String(raw[headerMapping.lead_time_days]).trim());
        if (!isNaN(lt) && lt > 0) leadTimeDays = Math.round(lt);
      }

      let safetyStock: number | undefined;
      if (headerMapping.safety_stock && raw[headerMapping.safety_stock] !== undefined && raw[headerMapping.safety_stock] !== '') {
        const ss = parseFloat(String(raw[headerMapping.safety_stock]).trim());
        if (!isNaN(ss) && ss >= 0) safetyStock = Math.round(ss);
      }

      // 5. Duplicate handling (same product_id on same date)
      const duplicateKey = `${productId}__${normalizedDate}`;
      if (rowKeysSeen.has(duplicateKey)) {
        duplicateRowsCount++;
        const existingIdx = rowKeysSeen.get(duplicateKey)!;
        const existing = validRows[existingIdx];

        // Sum units_sold for multiple sales records on same date
        existing.units_sold += unitsSold;

        // Keep latest metadata if provided
        if (productName) existing.product_name = productName;
        if (price !== undefined) existing.price = price;
        if (inventoryLevel !== undefined) existing.inventory_level = inventoryLevel;
        if (promotion !== undefined) existing.promotion = promotion;
        if (category) existing.category = category;
        if (leadTimeDays !== undefined) existing.lead_time_days = leadTimeDays;
        if (safetyStock !== undefined) existing.safety_stock = safetyStock;
      } else {
        const normRow: NormalizedSmartStockRow = {
          date: normalizedDate,
          product_id: productId,
          units_sold: unitsSold,
          product_name: productName,
          price,
          inventory_level: inventoryLevel,
          promotion,
          category,
          lead_time_days: leadTimeDays,
          safety_stock: safetyStock
        };
        rowKeysSeen.set(duplicateKey, validRows.length);
        validRows.push(normRow);
      }
    }

    if (validRows.length === 0) {
      throw new Error(
        `NO_VALID_DATA: None of the ${rawRows.length} uploaded rows passed validation. ` +
        `Reasons: ${invalidRows.slice(0, 3).map((r) => `Row ${r.rowNumber}: ${r.reason}`).join(' | ')}`
      );
    }

    // 6. Detect Product Summaries and Date Range
    const productMap = new Map<string, ProductSummaryInUpload>();
    let minDate = validRows[0].date;
    let maxDate = validRows[0].date;

    for (const r of validRows) {
      if (r.date < minDate) minDate = r.date;
      if (r.date > maxDate) maxDate = r.date;

      const existingProd = productMap.get(r.product_id);
      if (existingProd) {
        existingProd.rowCount++;
        existingProd.totalHistoricalUnits += r.units_sold;
        if (r.product_name) existingProd.product_name = r.product_name;
        if (r.category) existingProd.category = r.category;
        if (r.inventory_level !== undefined) existingProd.latestInventory = r.inventory_level;
        if (r.lead_time_days !== undefined) existingProd.leadTimeDays = r.lead_time_days;
      } else {
        productMap.set(r.product_id, {
          product_id: r.product_id,
          product_name: r.product_name,
          category: r.category,
          rowCount: 1,
          totalHistoricalUnits: r.units_sold,
          latestInventory: r.inventory_level,
          leadTimeDays: r.lead_time_days
        });
      }
    }

    const totalDays = this.calculateDaysBetween(minDate, maxDate) + 1;
    const detectedInterval = this.detectInterval(validRows);

    // Identify optional columns status
    const presentOptional: string[] = [];
    const missingOptional: string[] = [];
    const optionalKeys = ['product_name', 'price', 'inventory_level', 'promotion', 'category', 'lead_time_days', 'safety_stock'];
    for (const opt of optionalKeys) {
      if (headerMapping[opt]) presentOptional.push(opt);
      else missingOptional.push(opt);
    }

    const summary: SmartStockValidationSummary = {
      totalUploaded: rawRows.length,
      validRows: validRows.length,
      invalidRowsCount: invalidRows.length,
      invalidRows: invalidRows.slice(0, 50), // Cap invalid rows to 50 for clean reporting
      duplicateRowsCount,
      duplicateHandlingExplanation: duplicateRowsCount > 0
        ? `Aggregated ${duplicateRowsCount} duplicate (product_id, date) rows by summing sales quantities and keeping the latest inventory/lead-time values.`
        : 'No duplicate (product_id, date) observations found.',
      detectedHeaders,
      mappedHeaders: headerMapping,
      detectedInterval,
      productsFound: Array.from(productMap.values()),
      dateRange: {
        start: minDate,
        end: maxDate,
        totalDays
      },
      missingOptionalColumns: missingOptional,
      presentOptionalColumns: presentOptional,
      samplePreview: validRows.slice(0, 5)
    };

    return {
      rows: validRows,
      summary
    };
  }

  /**
   * Matches detected CSV headers with known synonyms
   */
  private static detectHeaderMapping(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    const normalizedHeaders = headers.map((h) => ({
      original: h,
      clean: h.toLowerCase().trim().replace(/[\s\-_]+/g, '_')
    }));

    for (const [standardKey, aliases] of Object.entries(HEADER_ALIASES)) {
      // 1. Exact match
      let match = normalizedHeaders.find((h) => h.clean === standardKey);
      if (!match) {
        // 2. Alias match
        match = normalizedHeaders.find((h) => aliases.includes(h.clean));
      }
      if (!match) {
        // 3. Substring match
        match = normalizedHeaders.find((h) => aliases.some((alias) => h.clean.includes(alias)));
      }

      if (match) {
        mapping[standardKey] = match.original;
      }
    }

    return mapping;
  }

  /**
   * Robust date parser returning standard ISO YYYY-MM-DD
   */
  private static parseDateSafely(val: any): string | null {
    if (!val) return null;
    const str = String(val).trim();
    if (!str) return null;

    // Check direct YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : str;
    }

    // Check YYYY/MM/DD
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(str)) {
      const parts = str.split('/');
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    // Check MM/DD/YYYY or DD/MM/YYYY
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(str)) {
      const parts = str.split(/[\/\-]/);
      const year = parts[2];
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);

      let month: number;
      let day: number;

      if (p0 > 12 && p1 <= 12) {
        // DD/MM/YYYY
        day = p0;
        month = p1;
      } else {
        // Default MM/DD/YYYY
        month = p0;
        day = p1;
      }

      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }

    // General fallback
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getUTCFullYear();
      const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
      const d = String(parsed.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    return null;
  }

  private static calculateDaysBetween(start: string, end: string): number {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  private static detectInterval(rows: NormalizedSmartStockRow[]): 'daily' | 'weekly' | 'irregular' {
    if (rows.length < 3) return 'daily';
    const dates = Array.from(new Set(rows.map((r) => r.date))).sort();
    if (dates.length < 3) return 'daily';

    const diffs: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      const d1 = new Date(dates[i - 1]).getTime();
      const d2 = new Date(dates[i]).getTime();
      const dayDiff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (dayDiff > 0) diffs.push(dayDiff);
    }

    if (diffs.length === 0) return 'daily';
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

    if (avgDiff >= 6 && avgDiff <= 8) return 'weekly';
    if (avgDiff <= 2) return 'daily';
    return 'irregular';
  }
}
