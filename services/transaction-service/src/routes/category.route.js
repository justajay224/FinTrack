const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const {
    createCategoryValidation,
    updateCategoryValidation,
    idParamValidation
} = require('../validations/category.validation');

// All routes require authentication
router.use(authMiddleware);

// Initialize default categories (first time setup)
router.post('/init', categoryController.initDefaultCategories);

// CRUD routes
router.get('/', categoryController.getCategories);

router.get(
    '/:id',
    idParamValidation,
    validate,
    categoryController.getCategoryById
);

router.post(
    '/',
    createCategoryValidation,
    validate,
    categoryController.createCategory
);

router.put(
    '/:id',
    updateCategoryValidation,
    validate,
    categoryController.updateCategory
);

router.delete(
    '/:id',
    idParamValidation,
    validate,
    categoryController.deleteCategory
);

module.exports = router;
