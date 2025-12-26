const User = require('../models/user.model');

class UserService {
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
        return user.toJSON();
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, updateData) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        // Only allow updating name
        if (updateData.name) {
            user.name = updateData.name;
        }

        await user.save();
        return user.toJSON();
    }

    /**
     * Change user password
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw { status: 400, message: 'Current password is incorrect' };
        }

        // Update password (will be hashed by model hook)
        user.password = newPassword;
        await user.save();

        return true;
    }

    /**
     * Deactivate account (soft delete alternative)
     */
    async deactivateAccount(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        user.is_active = false;
        await user.save();

        return true;
    }

    /**
     * Delete account (soft delete)
     */
    async deleteAccount(userId, password) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        // Verify password before deletion
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw { status: 400, message: 'Password is incorrect' };
        }

        // Soft delete (paranoid mode)
        await user.destroy();

        return true;
    }
}

module.exports = new UserService();
