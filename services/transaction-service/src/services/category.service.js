const Category = require('../models/category.model');
const { Op } = require('sequelize');

class CategoryService {
    /**
     * Create default categories for new user
     */
    async createDefaultCategories(userId) {
        const defaultCategories = [
            // Income categories
            { name: 'Gaji', type: 'income', is_default: true },
            { name: 'Bonus', type: 'income', is_default: true },
            { name: 'Investasi', type: 'income', is_default: true },
            { name: 'Freelance', type: 'income', is_default: true },
            { name: 'Hadiah', type: 'income', is_default: true },
            { name: 'Lainnya', type: 'income', is_default: true },
            // Expense categories
            { name: 'Makanan & Minuman', type: 'expense', is_default: true },
            { name: 'Transportasi', type: 'expense', is_default: true },
            { name: 'Belanja', type: 'expense', is_default: true },
            { name: 'Tagihan & Utilitas', type: 'expense', is_default: true },
            { name: 'Hiburan', type: 'expense', is_default: true },
            { name: 'Kesehatan', type: 'expense', is_default: true },
            { name: 'Pendidikan', type: 'expense', is_default: true },
            { name: 'Olahraga', type: 'expense', is_default: true },
            { name: 'Pakaian', type: 'expense', is_default: true },
            { name: 'Rumah Tangga', type: 'expense', is_default: true },
            { name: 'Lainnya', type: 'expense', is_default: true }
        ];

        const categories = defaultCategories.map(cat => ({ ...cat, user_id: userId }));
        await Category.bulkCreate(categories);
    }

    /**
     * Get all categories for a user
     */
    async getCategories(userId, type = null) {
        const where = { user_id: userId };
        if (type) {
            where.type = type;
        }

        return await Category.findAll({
            where,
            order: [['is_default', 'DESC'], ['name', 'ASC']]
        });
    }

    /**
     * Get category by ID
     */
    async getCategoryById(userId, categoryId) {
        const category = await Category.findOne({
            where: { id: categoryId, user_id: userId }
        });

        if (!category) {
            throw { status: 404, message: 'Category not found' };
        }

        return category;
    }

    /**
     * Create new category
     */
    async createCategory(userId, data) {
        const categoryName = data.name.trim();

        // Check if category with same name and type exists (including soft-deleted)
        // Using case-insensitive comparison with LOWER()
        const existing = await Category.findOne({
            where: {
                user_id: userId,
                type: data.type
            },
            // Include soft-deleted records
            paranoid: false
        });

        // Find with case-insensitive manual check
        const allCategories = await Category.findAll({
            where: {
                user_id: userId,
                type: data.type
            },
            paranoid: false // Include soft-deleted
        });

        const matchingCategory = allCategories.find(
            cat => cat.name.toLowerCase() === categoryName.toLowerCase()
        );

        if (matchingCategory) {
            // If category exists and is NOT soft-deleted, reject
            if (matchingCategory.deleted_at === null) {
                throw { status: 409, message: 'Category with this name already exists' };
            }

            // If category exists and IS soft-deleted, restore it
            await matchingCategory.restore();
            return matchingCategory;
        }

        // Create new category
        return await Category.create({
            user_id: userId,
            name: categoryName,
            type: data.type,
            is_default: false
        });
    }

    /**
     * Update category
     */
    async updateCategory(userId, categoryId, data) {
        const category = await this.getCategoryById(userId, categoryId);
        const newName = data.name ? data.name.trim() : null;

        // Check for duplicate name if name is being changed (case-insensitive)
        if (newName && newName.toLowerCase() !== category.name.toLowerCase()) {
            const allCategories = await Category.findAll({
                where: {
                    user_id: userId,
                    type: category.type,
                    id: { [Op.ne]: categoryId }
                }
            });

            const duplicate = allCategories.find(
                cat => cat.name.toLowerCase() === newName.toLowerCase()
            );

            if (duplicate) {
                throw { status: 409, message: 'Category with this name already exists' };
            }
        }

        await category.update({
            name: newName || category.name
        });

        return category;
    }

    /**
     * Delete category (soft delete)
     */
    async deleteCategory(userId, categoryId) {
        const category = await this.getCategoryById(userId, categoryId);

        // Prevent deletion of default categories
        if (category.is_default) {
            throw { status: 400, message: 'Cannot delete default category' };
        }

        await category.destroy();
        return true;
    }
}

module.exports = new CategoryService();
