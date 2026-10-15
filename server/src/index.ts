import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes.js';
import smartStockRoutes from './routes/smartStockRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS safely for frontend development and local access
app.use(cors({
  origin: true, // Allow dev origins like localhost:5173
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Rate limiter for review analysis endpoint: 60 requests per 15 minutes per IP
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many analysis requests from this IP. Please wait a few minutes before trying again.'
    }
  }
});

// Apply rate limiter specifically to analyze endpoint
app.use('/api/reviews/analyze', analysisLimiter);
app.use('/api/smartstock/forecast', analysisLimiter);

// Mount Application Routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/smartstock', smartStockRoutes);

// Root health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      service: 'Review2Action & SmartStock AI API',
      modules: ['Review2Action AI', 'SmartStock AI'],
      status: 'operational',
      version: '1.1.0',
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 Route handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested API route does not exist.'
    }
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Review2Action Server Error]', err);

  const status = err.status || (err.message && err.message.includes('INVALID_FILE_TYPE') ? 400 : 500);
  const code = err.code || 'SERVER_ERROR';
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(status).json({
    success: false,
    error: {
      code,
      message
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Review2Action AI Backend is running on http://localhost:${PORT}`);
  console.log(`📊 Mode: ${process.env.USE_AMD_LLM === 'true' ? 'AMD LLM Provider' : 'Local Heuristic Analysis Engine'}`);
});

export default app;
