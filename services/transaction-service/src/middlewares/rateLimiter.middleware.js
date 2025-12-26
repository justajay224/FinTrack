const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response.util');
require('dotenv').config();

const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return errorResponse(res, 'Too many requests, please try again later', 429);
    }
});

module.exports = { apiLimiter };
