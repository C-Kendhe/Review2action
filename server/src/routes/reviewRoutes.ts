import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { CleaningService } from '../services/cleaningService.js';
import { analysisService } from '../services/analysisService.js';
import { SAMPLE_REVIEWS_CSV } from '../data/sampleReviews.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

// Configure Multer for in-memory file uploads with 10MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter: (_req, file, cb) => {
    const isCsvName = file.originalname.toLowerCase().endsWith('.csv');
    const isCsvMime = file.mimetype.includes('csv') ||
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/octet-stream';

    if (isCsvName || isCsvMime) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE: Only CSV files (.csv) are accepted.'));
    }
  }
});

/**
 * POST /api/reviews/analyze
 * Analyzes uploaded CSV or raw CSV content
 */
router.post(
  '/analyze',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let csvContent = '';

      if (req.file) {
        // Uploaded via multipart form
        csvContent = req.file.buffer.toString('utf-8');
      } else if (req.body && typeof req.body.csvContent === 'string') {
        // Uploaded via JSON body payload
        csvContent = req.body.csvContent;
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'No CSV file or CSV content provided. Please upload a .csv file.'
          }
        });
        return;
      }

      if (!csvContent || csvContent.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'EMPTY_FILE',
            message: 'The uploaded CSV file is empty. Please provide a file with review data.'
          }
        });
        return;
      }

      // 1. Clean and normalize
      const { reviews, summary } = CleaningService.cleanCsvContent(csvContent, 10000);

      if (reviews.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_VALID_REVIEWS',
            message: 'No valid review text could be extracted after cleaning. Check if rows contain text.',
            details: summary
          }
        });
        return;
      }

      // 2. Perform sentiment and topic analysis
      const analysisResult = await analysisService.analyzeReviews(reviews, summary);

      const response: ApiResponse = {
        success: true,
        data: analysisResult
      };

      res.status(200).json(response);
    } catch (err: any) {
      if (err.message && err.message.startsWith('INVALID_CSV_HEADERS:')) {
        res.status(422).json({
          success: false,
          error: {
            code: 'INVALID_CSV_HEADERS',
            message: err.message
          }
        });
        return;
      }
      next(err);
    }
  }
);

/**
 * GET /api/sample-csv
 * Serves downloadable realistic sample CSV
 */
router.get('/sample-csv', (_req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sample_ecommerce_reviews.csv"');
  res.status(200).send(SAMPLE_REVIEWS_CSV);
});

/**
 * GET /api/sample-data
 * Runs analysis on the bundled sample CSV for instant 1-click preview
 */
router.get('/sample-data', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reviews, summary } = CleaningService.cleanCsvContent(SAMPLE_REVIEWS_CSV);
    const analysisResult = await analysisService.analyzeReviews(reviews, summary);

    res.status(200).json({
      success: true,
      data: analysisResult
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/health
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'Review2Action AI Backend',
      provider: analysisService.getActiveProviderName(),
      timestamp: new Date().toISOString(),
      amdIntegrationReady: true
    }
  });
});

export default router;
