const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class UserController {
    /**
     * GET /api/users/profile
     */
    async getProfile(req, res) {
        try {
            const user = await userService.getUserById(req.user.id);

            return successResponse(res, 'Profile retrieved successfully', { user });
        } catch (error) {
            console.error('Get profile error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to get profile';
            return errorResponse(res, message, status);
        }
    }

    /**
     * PUT /api/users/profile
     */
    async updateProfile(req, res) {
        try {
            const user = await userService.updateProfile(req.user.id, req.body);

            return successResponse(res, 'Profile updated successfully', { user });
        } catch (error) {
            console.error('Update profile error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to update profile';
            return errorResponse(res, message, status);
        }
    }

    /**
     * PUT /api/users/password
     */
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            await userService.changePassword(req.user.id, currentPassword, newPassword);

            return successResponse(res, 'Password changed successfully');
        } catch (error) {
            console.error('Change password error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to change password';
            return errorResponse(res, message, status);
        }
    }

    /**
     * DELETE /api/users/account
     */
    async deleteAccount(req, res) {
        try {
            const { password } = req.body;
            await userService.deleteAccount(req.user.id, password);

            return successResponse(res, 'Account deleted successfully');
        } catch (error) {
            console.error('Delete account error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to delete account';
            return errorResponse(res, message, status);
        }
    }
}

module.exports = new UserController();
