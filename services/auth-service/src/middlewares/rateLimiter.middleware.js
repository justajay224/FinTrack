const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response.util');
require('dotenv').config();

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return errorResponse(res, 'Too many requests, please try again later', 429);
    }
});

// Stricter rate limiter for auth endpoints (login/register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    message: { success: false, message: 'Too many authentication attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return errorResponse(res, 'Too many authentication attempts, please try again later', 429);
    },
    skipSuccessfulRequests: false
});

// Very strict limiter for password change
const passwordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: { success: false, message: 'Too many password change attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return errorResponse(res, 'Too many password change attempts, please try again later', 429);
    }
});

module.exports = { apiLimiter, authLimiter, passwordLimiter };
