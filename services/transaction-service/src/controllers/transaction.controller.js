const transactionService = require('../services/transaction.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.util');

class TransactionController {
    /**
     * GET /api/transactions
     */
    async getTransactions(req, res) {
        try {
            const result = await transactionService.getTransactions(req.user.id, req.query);

            return paginatedResponse(
                res,
                'Transactions retrieved successfully',
                result.transactions,
                result.pagination
            );
        } catch (error) {
            console.error('Get transactions error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to get transactions';
            return errorResponse(res, message, status);
        }
    }

    /**
     * GET /api/transactions/:id
     */
    async getTransactionById(req, res) {
        try {
            const transaction = await transactionService.getTransactionById(req.user.id, req.params.id);

            return successResponse(res, 'Transaction retrieved successfully', { transaction });
        } catch (error) {
            console.error('Get transaction error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to get transaction';
            return errorResponse(res, message, status);
        }
    }

    /**
     * POST /api/transactions
     */
    async createTransaction(req, res) {
        try {
            const transaction = await transactionService.createTransaction(req.user.id, req.body);

            return successResponse(res, 'Transaction created successfully', { transaction }, 201);
        } catch (error) {
            console.error('Create transaction error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to create transaction';
            return errorResponse(res, message, status);
        }
    }

    /**
     * PUT /api/transactions/:id
     */
    async updateTransaction(req, res) {
        try {
            const transaction = await transactionService.updateTransaction(req.user.id, req.params.id, req.body);

            return successResponse(res, 'Transaction updated successfully', { transaction });
        } catch (error) {
            console.error('Update transaction error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to update transaction';
            return errorResponse(res, message, status);
        }
    }

    /**
     * DELETE /api/transactions/:id
     */
    async deleteTransaction(req, res) {
        try {
            await transactionService.deleteTransaction(req.user.id, req.params.id);

            return successResponse(res, 'Transaction deleted successfully');
        } catch (error) {
            console.error('Delete transaction error:', error);
            const status = error.status || 500;
            const message = error.message || 'Failed to delete transaction';
            return errorResponse(res, message, status);
        }
    }
}

module.exports = new TransactionController();
