const Transaction = require('../models/transaction.model');
const Category = require('../models/category.model');
const { Op } = require('sequelize');

class TransactionService {
    /**
     * Get all transactions for a user with filters and pagination
     */
    async getTransactions(userId, filters = {}) {
        const {
            page = 1,
            limit = 20,
            type,
            category_id,
            start_date,
            end_date
        } = filters;

        const where = { user_id: userId };

        // Apply filters
        if (type) {
            where.type = type;
        }
        if (category_id) {
            where.category_id = category_id;
        }
        if (start_date && end_date) {
            where.transaction_date = {
                [Op.between]: [start_date, end_date]
            };
        } else if (start_date) {
            where.transaction_date = {
                [Op.gte]: start_date
            };
        } else if (end_date) {
            where.transaction_date = {
                [Op.lte]: end_date
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Transaction.findAndCountAll({
            where,
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }],
            order: [['transaction_date', 'DESC'], ['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        return {
            transactions: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    /**
     * Get transaction by ID
     */
    async getTransactionById(userId, transactionId) {
        const transaction = await Transaction.findOne({
            where: { id: transactionId, user_id: userId },
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }]
        });

        if (!transaction) {
            throw { status: 404, message: 'Transaction not found' };
        }

        return transaction;
    }

    /**
     * Create new transaction
     */
    async createTransaction(userId, data) {
        // Verify category exists and belongs to user
        const category = await Category.findOne({
            where: {
                id: data.category_id,
                [Op.or]: [
                    { user_id: userId },
                    { user_id: 0 }
                ]
            }
        });

        if (!category) {
            throw { status: 404, message: 'Category not found' };
        }

        // Verify category type matches transaction type
        if (category.type !== data.type) {
            throw { status: 400, message: `Category is for ${category.type}, not ${data.type}` };
        }

        const transaction = await Transaction.create({
            user_id: userId,
            category_id: data.category_id,
            type: data.type,
            amount: data.amount,
            notes: data.notes || null,
            transaction_date: data.transaction_date
        });

        return await this.getTransactionById(userId, transaction.id);
    }

    /**
     * Update transaction
     */
    async updateTransaction(userId, transactionId, data) {
        const transaction = await Transaction.findOne({
            where: { id: transactionId, user_id: userId }
        });

        if (!transaction) {
            throw { status: 404, message: 'Transaction not found' };
        }

        // If changing category, verify it exists
        if (data.category_id) {
            const category = await Category.findOne({
                where: {
                    id: data.category_id,
                    [Op.or]: [
                        { user_id: userId },
                        { user_id: 0 }
                    ]
                }
            });

            if (!category) {
                throw { status: 404, message: 'Category not found' };
            }

            const newType = data.type || transaction.type;
            if (category.type !== newType) {
                throw { status: 400, message: `Category is for ${category.type}, not ${newType}` };
            }
        }

        await transaction.update({
            category_id: data.category_id || transaction.category_id,
            type: data.type || transaction.type,
            amount: data.amount || transaction.amount,
            notes: data.notes !== undefined ? data.notes : transaction.notes,
            transaction_date: data.transaction_date || transaction.transaction_date
        });

        return await this.getTransactionById(userId, transactionId);
    }

    /**
     * Delete transaction (soft delete)
     */
    async deleteTransaction(userId, transactionId) {
        const transaction = await Transaction.findOne({
            where: { id: transactionId, user_id: userId }
        });

        if (!transaction) {
            throw { status: 404, message: 'Transaction not found' };
        }

        await transaction.destroy();
        return true;
    }

    /**
     * Get summary for a date range
     */
    async getSummary(userId, startDate, endDate) {
        const where = {
            user_id: userId,
            transaction_date: {
                [Op.between]: [startDate, endDate]
            }
        };

        const transactions = await Transaction.findAll({ where });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += parseFloat(t.amount);
            } else {
                totalExpense += parseFloat(t.amount);
            }
        });

        return {
            total_income: totalIncome,
            total_expense: totalExpense,
            balance: totalIncome - totalExpense,
            transaction_count: transactions.length
        };
    }
}

module.exports = new TransactionService();
