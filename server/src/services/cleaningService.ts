import Papa from 'papaparse';
import { RawReviewRow, NormalizedReview, CleaningSummary } from '../types/index.js';

const HEADER_SYNONYMS: Record<keyof Omit<NormalizedReview, 'review_id'> | 'review_id', string[]> = {
  review_text: [
    'review_text', 'review', 'text', 'comment', 'content', 'feedback',
    'review_body', 'customer_review', 'body', 'message', 'opinion', 'review_content'
  ],
  rating: [
    'rating', 'stars', 'star_rating', 'score', 'rate', 'review_rating',
    'overall_rating', 'grade', 'stars_rating'
  ],
  product_name: [
    'product_name', 'product', 'item', 'item_name', 'product_title',
    'product_description', 'sku', 'model', 'brand'
  ],
  review_date: [
    'review_date', 'date', 'created_at', 'timestamp', 'time',
    'posted_at', 'review_time', 'purchase_date', 'order_date'
  ],
  review_title: [
    'review_title', 'headline', 'summary', 'subject', 'title', 'heading'
  ],
  review_id: [
    'review_id', 'id', 'reviewid', 'uuid', 'row_id', 'index'
  ]
};

export class CleaningService {
  /**
   * Parse raw CSV text and clean it
   */
  public static cleanCsvContent(csvString: string, maxRows = 10000): {
    reviews: NormalizedReview[];
    summary: CleaningSummary;
  } {
    const parseResult = Papa.parse<RawReviewRow>(csvString, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim().toLowerCase().replace(/[\s\-_]+/g, '_')
    });

    if (parseResult.errors && parseResult.errors.length > 0) {
      // Collect errors or handle non-fatal parse errors
    }

    const rawRows = parseResult.data || [];
    const detectedHeaders = parseResult.meta.fields || [];

    // Map headers
    const headerMapping = this.detectHeaderMapping(detectedHeaders);

    if (!headerMapping.review_text) {
      const availableHeaders = detectedHeaders.length > 0
        ? detectedHeaders.join(', ')
        : 'None detected';
      throw new Error(
        `INVALID_CSV_HEADERS: Missing required 'review_text' column. ` +
        `We searched for 'review_text', 'review', 'text', 'comment', 'content', 'feedback'. ` +
        `Found headers: [${availableHeaders}]. Please check your CSV format.`
      );
    }

    let removedBlank = 0;
    let malformedSkipped = 0;
    let removedDuplicates = 0;

    const seenTexts = new Set<string>();
    const cleanedReviews: NormalizedReview[] = [];

    let hasRatingsCount = 0;
    let hasDatesCount = 0;
    let hasProductsCount = 0;

    const totalUploaded = Math.min(rawRows.length, maxRows);

    for (let i = 0; i < totalUploaded; i++) {
      const row = rawRows[i];
      if (!row || typeof row !== 'object') {
        malformedSkipped++;
        continue;
      }

      // Extract review text
      const rawText = row[headerMapping.review_text];
      if (rawText === undefined || rawText === null) {
        removedBlank++;
        continue;
      }

      const textStr = String(rawText).trim();
      if (!textStr || textStr.length < 2) {
        removedBlank++;
        continue;
      }

      // Deduplication based on lowercase trimmed text
      const dedupeKey = textStr.toLowerCase();
      if (seenTexts.has(dedupeKey)) {
        removedDuplicates++;
        continue;
      }
      seenTexts.add(dedupeKey);

      // Extract rating if present
      let coercedRating: number | null = null;
      if (headerMapping.rating && row[headerMapping.rating] !== undefined && row[headerMapping.rating] !== null) {
        const rawRating = String(row[headerMapping.rating]).trim();
        const numRating = parseFloat(rawRating);
        // Valid if between 1 and 5 (or 0.5 - 5)
        if (!isNaN(numRating) && numRating >= 1 && numRating <= 5) {
          coercedRating = Math.round(numRating * 10) / 10; // keep up to 1 decimal
          hasRatingsCount++;
        }
      }

      // Extract product name
      let productName: string | null = null;
      if (headerMapping.product_name && row[headerMapping.product_name]) {
        const pName = String(row[headerMapping.product_name]).trim();
        if (pName.length > 0) {
          productName = pName;
          hasProductsCount++;
        }
      }

      // Extract date
      let reviewDate: string | null = null;
      if (headerMapping.review_date && row[headerMapping.review_date]) {
        const dStr = String(row[headerMapping.review_date]).trim();
        if (dStr.length > 0) {
          const parsedDate = new Date(dStr);
          if (!isNaN(parsedDate.getTime())) {
            // ISO format YYYY-MM-DD
            reviewDate = parsedDate.toISOString().split('T')[0];
            hasDatesCount++;
          } else {
            // Keep original string if date-like
            reviewDate = dStr;
            hasDatesCount++;
          }
        }
      }

      // Extract title
      let reviewTitle: string | null = null;
      if (headerMapping.review_title && row[headerMapping.review_title]) {
        const tStr = String(row[headerMapping.review_title]).trim();
        if (tStr.length > 0) {
          reviewTitle = tStr;
        }
      }

      // Extract or generate review ID
      let reviewId = `rev-${i + 1}`;
      if (headerMapping.review_id && row[headerMapping.review_id]) {
        const idStr = String(row[headerMapping.review_id]).trim();
        if (idStr.length > 0) {
          reviewId = idStr;
        }
      }

      cleanedReviews.push({
        review_id: reviewId,
        review_text: textStr,
        rating: coercedRating,
        product_name: productName,
        review_date: reviewDate,
        review_title: reviewTitle
      });
    }

    const summary: CleaningSummary = {
      totalUploaded,
      validReviews: cleanedReviews.length,
      removedBlank,
      removedDuplicates,
      malformedSkipped,
      hasRatingsCount,
      hasDatesCount,
      hasProductsCount,
      detectedHeaders,
      mappedHeaders: headerMapping,
      sampleCleanedPreview: cleanedReviews.slice(0, 5)
    };

    return {
      reviews: cleanedReviews,
      summary
    };
  }

  /**
   * Find matching mapped headers from detected fields
   */
  private static detectHeaderMapping(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};

    for (const [targetKey, synonyms] of Object.entries(HEADER_SYNONYMS)) {
      // Find exact or closest match
      for (const rawHeader of headers) {
        const cleanHeader = rawHeader.toLowerCase().trim();
        if (synonyms.includes(cleanHeader)) {
          mapping[targetKey] = rawHeader;
          break;
        }
      }
    }

    return mapping;
  }
}
