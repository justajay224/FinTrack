const { verifyToken } = require('../utils/jwt.util');
const { isTokenBlacklisted } = require('../config/redis');
const { errorResponse } = require('../utils/response.util');
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Access denied. No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return errorResponse(res, 'Invalid or expired token', 401);
        }

        // Check if token is blacklisted
        const isBlacklisted = await isTokenBlacklisted(decoded.jti);
        if (isBlacklisted) {
            return errorResponse(res, 'Token has been revoked', 401);
        }

        // Get user from database
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return errorResponse(res, 'User not found', 401);
        }

        if (!user.is_active) {
            return errorResponse(res, 'Account is deactivated', 401);
        }

        // Attach user and token info to request
        req.user = user;
        req.tokenJti = decoded.jti;
        req.token = token;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return errorResponse(res, 'Authentication failed', 401);
    }
};

module.exports = { authMiddleware };
