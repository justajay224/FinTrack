const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const {
    createTransactionValidation,
    updateTransactionValidation,
    listTransactionValidation,
    idParamValidation
} = require('../validations/transaction.validation');

// All routes require authentication
router.use(authMiddleware);

// List with filters and pagination
router.get(
    '/',
    listTransactionValidation,
    validate,
    transactionController.getTransactions
);

// Get single transaction
router.get(
    '/:id',
    idParamValidation,
    validate,
    transactionController.getTransactionById
);

// Create transaction
router.post(
    '/',
    createTransactionValidation,
    validate,
    transactionController.createTransaction
);

// Update transaction
router.put(
    '/:id',
    updateTransactionValidation,
    validate,
    transactionController.updateTransaction
);

// Delete transaction
router.delete(
    '/:id',
    idParamValidation,
    validate,
    transactionController.deleteTransaction
);

module.exports = router;
