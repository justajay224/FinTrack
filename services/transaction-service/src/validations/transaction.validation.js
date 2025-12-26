const { body, param, query } = require('express-validator');

const createTransactionValidation = [
    body('category_id')
        .notEmpty().withMessage('Category is required')
        .isInt({ min: 1 }).withMessage('Invalid category ID'),

    body('type')
        .notEmpty().withMessage('Type is required')
        .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

    body('transaction_date')
        .notEmpty().withMessage('Transaction date is required')
        .isDate().withMessage('Invalid date format (use YYYY-MM-DD)')
];

const updateTransactionValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid transaction ID'),

    body('category_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Invalid category ID'),

    body('type')
        .optional()
        .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

    body('amount')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

    body('transaction_date')
        .optional()
        .isDate().withMessage('Invalid date format')
];

const listTransactionValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Invalid page number'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

    query('type')
        .optional()
        .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

    query('start_date')
        .optional()
        .isDate().withMessage('Invalid start date format'),

    query('end_date')
        .optional()
        .isDate().withMessage('Invalid end date format')
];

const idParamValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid ID')
];

module.exports = {
    createTransactionValidation,
    updateTransactionValidation,
    listTransactionValidation,
    idParamValidation
};
