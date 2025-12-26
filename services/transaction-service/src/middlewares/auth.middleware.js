const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response.util');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Access denied. No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return errorResponse(res, 'Invalid or expired token', 401);
        }

        // Attach user info to request
        req.user = {
            id: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 'Invalid token', 401);
        }
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Token expired', 401);
        }
        console.error('Auth middleware error:', error);
        return errorResponse(res, 'Authentication failed', 401);
    }
};

module.exports = { authMiddleware };
