"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const reviewRoutes_js_1 = __importDefault(require("./routes/reviewRoutes.js"));
const smartStockRoutes_js_1 = __importDefault(require("./routes/smartStockRoutes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS safely for frontend development and local access
app.use((0, cors_1.default)({
    origin: true, // Allow dev origins like localhost:5173
    credentials: true
}));
// Body parser
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
// Rate limiter for review analysis endpoint: 60 requests per 15 minutes per IP
const analysisLimiter = (0, express_rate_limit_1.default)({
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
app.use('/api/reviews', reviewRoutes_js_1.default);
app.use('/api/smartstock', smartStockRoutes_js_1.default);
// Root health check endpoint
app.get('/api/health', (_req, res) => {
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
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'ROUTE_NOT_FOUND',
            message: 'The requested API route does not exist.'
        }
    });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
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
exports.default = app;
