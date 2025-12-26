const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken, verifyToken, getTokenExpiresIn } = require('../utils/jwt.util');
const { blacklistToken, isTokenBlacklisted } = require('../config/redis');
const { validateEmail } = require('../utils/email.util');

class AuthService {
    /**
     * Register a new user
     */
    async register(name, email, password) {
        // Validate email domain
        const emailValidation = await validateEmail(email);
        if (!emailValidation.valid) {
            throw { status: 400, message: emailValidation.message };
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw { status: 409, message: 'Email already registered' };
        }

        // Create user
        const user = await User.create({ name, email, password });

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return {
            user: user.toJSON(),
            accessToken: accessToken.token,
            refreshToken: refreshToken.token
        };
    }

    /**
     * Login user
     */
    async login(email, password) {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw { status: 401, message: 'Invalid email or password' };
        }

        // Check if account is active
        if (!user.is_active) {
            throw { status: 401, message: 'Account is deactivated' };
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw { status: 401, message: 'Invalid email or password' };
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return {
            user: user.toJSON(),
            accessToken: accessToken.token,
            refreshToken: refreshToken.token
        };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshTokenStr) {
        // Verify refresh token
        const decoded = verifyToken(refreshTokenStr);
        if (!decoded || decoded.type !== 'refresh') {
            throw { status: 401, message: 'Invalid refresh token' };
        }

        // Check if refresh token is blacklisted
        const isBlacklisted = await isTokenBlacklisted(decoded.jti);
        if (isBlacklisted) {
            throw { status: 401, message: 'Refresh token has been revoked' };
        }

        // Get user
        const user = await User.findByPk(decoded.userId);
        if (!user || !user.is_active) {
            throw { status: 401, message: 'User not found or inactive' };
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        return {
            accessToken: newAccessToken.token
        };
    }

    /**
     * Logout user - blacklist current token
     */
    async logout(token, jti) {
        const expiresIn = getTokenExpiresIn(token);
        if (expiresIn > 0) {
            await blacklistToken(jti, expiresIn);
        }
        return true;
    }

    /**
     * Logout from all devices - blacklist refresh token
     */
    async logoutAll(userId, refreshTokenStr) {
        const decoded = verifyToken(refreshTokenStr);
        if (decoded && decoded.jti) {
            const expiresIn = getTokenExpiresIn(refreshTokenStr);
            if (expiresIn > 0) {
                await blacklistToken(decoded.jti, expiresIn);
            }
        }
        return true;
    }
}

module.exports = new AuthService();
