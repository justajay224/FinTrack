const categoryService = require('../services/category.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class CategoryController {
    /**
     * GET /api/categories
     */
    async getCategories(req, res) {
        try {
            const type = req.query.type || null;
            const categories = await categoryService.getCategories(req.user.id, type);

            return successResponse(res, 'Categories retrieved successfully', { categories });
        } catch (error) {
            console.error('Get categories error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to get categories';
            return errorResponse(res, message, status);
        }
    }

    /**
     * GET /api/categories/:id
     */
    async getCategoryById(req, res) {
        try {
            const category = await categoryService.getCategoryById(req.user.id, req.params.id);

            return successResponse(res, 'Category retrieved successfully', { category });
        } catch (error) {
            console.error('Get category error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to get category';
            return errorResponse(res, message, status);
        }
    }

    /**
     * POST /api/categories
     */
    async createCategory(req, res) {
        try {
            const category = await categoryService.createCategory(req.user.id, req.body);

            return successResponse(res, 'Category created successfully', { category }, 201);
        } catch (error) {
            console.error('Create category error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to create category';
            return errorResponse(res, message, status);
        }
    }

    /**
     * PUT /api/categories/:id
     */
    async updateCategory(req, res) {
        try {
            const category = await categoryService.updateCategory(req.user.id, req.params.id, req.body);

            return successResponse(res, 'Category updated successfully', { category });
        } catch (error) {
            console.error('Update category error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to update category';
            return errorResponse(res, message, status);
        }
    }

    /**
     * DELETE /api/categories/:id
     */
    async deleteCategory(req, res) {
        try {
            await categoryService.deleteCategory(req.user.id, req.params.id);

            return successResponse(res, 'Category deleted successfully');
        } catch (error) {
            console.error('Delete category error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to delete category';
            return errorResponse(res, message, status);
        }
    }

    /**
     * POST /api/categories/init - Initialize default categories for user
     */
    async initDefaultCategories(req, res) {
        try {
            await categoryService.createDefaultCategories(req.user.id);

            return successResponse(res, 'Default categories created successfully', null, 201);
        } catch (error) {
            console.error('Init categories error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to create default categories';
            return errorResponse(res, message, status);
        }
    }
}

module.exports = new CategoryController();
