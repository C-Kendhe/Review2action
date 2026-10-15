"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const smartStockService_js_1 = require("../services/smartStockService.js");
const sampleSmartStock_js_1 = require("../data/sampleSmartStock.js");
const router = (0, express_1.Router)();
// Configure Multer for in-memory file uploads with 10MB limit
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
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
        }
        else {
            cb(new Error('INVALID_FILE_TYPE: Only CSV files (.csv) are accepted.'));
        }
    }
});
/**
 * POST /api/smartstock/forecast
 * Analyzes uploaded CSV or raw CSV content and computes demand forecasts & inventory metrics
 */
router.post('/forecast', upload.single('file'), async (req, res, next) => {
    try {
        let csvContent = '';
        if (req.file) {
            csvContent = req.file.buffer.toString('utf-8');
        }
        else if (req.body && typeof req.body.csvContent === 'string') {
            csvContent = req.body.csvContent;
        }
        else {
            res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_FILE',
                    message: 'No CSV file or CSV content provided. Please upload a .csv file with historical sales and inventory data.'
                }
            });
            return;
        }
        const horizonDaysRaw = req.body?.horizonDays || req.query?.horizonDays;
        const parsedHorizon = parseInt(String(horizonDaysRaw), 10);
        const horizonDays = [7, 14, 30].includes(parsedHorizon) ? parsedHorizon : 14;
        const result = await smartStockService_js_1.smartStockService.analyzeAndForecast(csvContent, { horizonDays });
        const response = {
            success: true,
            data: result
        };
        res.status(200).json(response);
    }
    catch (err) {
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
        if (err.message && err.message.startsWith('EMPTY_FILE:')) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'EMPTY_FILE',
                    message: err.message
                }
            });
            return;
        }
        if (err.message && err.message.startsWith('NO_VALID_DATA:')) {
            res.status(422).json({
                success: false,
                error: {
                    code: 'NO_VALID_DATA',
                    message: err.message
                }
            });
            return;
        }
        next(err);
    }
});
/**
 * GET /api/smartstock/sample-csv
 * Serves downloadable realistic sample CSV with 5 distinct product profiles
 */
router.get('/sample-csv', (_req, res) => {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="smartstock_sample_inventory.csv"');
    res.status(200).send(sampleSmartStock_js_1.SAMPLE_SMARTSTOCK_CSV);
});
/**
 * GET /api/smartstock/sample-forecast
 * Computes forecast on the bundled sample CSV for instant 1-click test
 */
router.get('/sample-forecast', async (req, res, next) => {
    try {
        const horizonDaysRaw = req.query?.horizonDays;
        const parsedHorizon = parseInt(String(horizonDaysRaw), 10);
        const horizonDays = [7, 14, 30].includes(parsedHorizon) ? parsedHorizon : 14;
        const result = await smartStockService_js_1.smartStockService.analyzeAndForecast(sampleSmartStock_js_1.SAMPLE_SMARTSTOCK_CSV, { horizonDays });
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (err) {
        next(err);
    }
});
/**
 * GET /api/smartstock/health
 */
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: 'healthy',
            service: 'SmartStock AI Module',
            provider: smartStockService_js_1.smartStockService.getActiveProviderName(),
            timestamp: new Date().toISOString(),
            amdIntegrationReady: true
        }
    });
});
exports.default = router;
