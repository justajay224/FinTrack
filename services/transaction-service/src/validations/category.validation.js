const { body, param } = require('express-validator');

const createCategoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('type')
        .notEmpty().withMessage('Type is required')
        .isIn(['income', 'expense']).withMessage('Type must be income or expense')
];

const updateCategoryValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid category ID'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
];

const idParamValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid ID')
];

module.exports = {
    createCategoryValidation,
    updateCategoryValidation,
    idParamValidation
};
