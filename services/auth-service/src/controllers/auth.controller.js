const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class AuthController {
    /**
     * POST /api/auth/register
     */
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const result = await authService.register(name, email, password);

            return successResponse(res, 'Registration successful', result, 201);
        } catch (error) {
            console.error('Register error:', error);
            const status = error.status || 500;
            const message = error.message || 'Registration failed';
            return errorResponse(res, message, status);
        }
    }

    /**
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            return successResponse(res, 'Login successful', result);
        } catch (error) {
            console.error('Login error:', error);
            const status = error.status || 500;
            const message = error.message || 'Login failed';
            return errorResponse(res, message, status);
        }
    }

    /**
     * POST /api/auth/refresh
     */
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshToken(refreshToken);

            return successResponse(res, 'Token refreshed successfully', result);
        } catch (error) {
            console.error('Refresh token error:', error);
            const status = error.status || 500;
            const message = error.message || 'Token refresh failed';
            return errorResponse(res, message, status);
        }
    }

    /**
     * POST /api/auth/logout
     */
    async logout(req, res) {
        try {
            await authService.logout(req.token, req.tokenJti);

            return successResponse(res, 'Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
            const status = error.status || 500;
            const message = error.message || 'Logout failed';
            return errorResponse(res, message, status);
        }
    }
}

module.exports = new AuthController();
