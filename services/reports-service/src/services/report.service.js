const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

class ReportService {
  /**
   * Get daily report
   */
  async getDailyReport(userId, date) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const transactions = await sequelize.query(`
      SELECT 
        t.id,
        t.type,
        t.amount,
        t.notes,
        t.transaction_date,
        c.name as category_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date = :targetDate
        AND t.deleted_at IS NULL
      ORDER BY t.created_at DESC
    `, {
      replacements: { userId, targetDate },
      type: QueryTypes.SELECT
    });

    // Category breakdown
    const categoryData = await sequelize.query(`
      SELECT 
        c.name as category,
        t.type,
        SUM(t.amount) as total,
        COUNT(*) as count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date = :targetDate
        AND t.deleted_at IS NULL
      GROUP BY c.id, t.type
      ORDER BY total DESC
    `, {
      replacements: { userId, targetDate },
      type: QueryTypes.SELECT
    });

    // Top Incomes (grouped by category)
    const incomeByCategory = transactions.filter(t => t.type === 'income').reduce((acc, t) => {
      const existing = acc.find(item => item.category_name === t.category_name);
      if (existing) {
        existing.amount = parseFloat(existing.amount) + parseFloat(t.amount);
      } else {
        acc.push({ category_name: t.category_name, amount: parseFloat(t.amount) });
      }
      return acc;
    }, []);
    const topIncomes = incomeByCategory.sort((a, b) => b.amount - a.amount).slice(0, 5);

    // Top Expenses (grouped by category)
    const expenseByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      const existing = acc.find(item => item.category_name === t.category_name);
      if (existing) {
        existing.amount = parseFloat(existing.amount) + parseFloat(t.amount);
      } else {
        acc.push({ category_name: t.category_name, amount: parseFloat(t.amount) });
      }
      return acc;
    }, []);
    const topExpenses = expenseByCategory.sort((a, b) => b.amount - a.amount).slice(0, 5);

    const summary = await this.calculateSummary(userId, targetDate, targetDate);

    return {
      date: targetDate,
      summary,
      recent_transactions: transactions,
      category_breakdown: categoryData,
      top_incomes: topIncomes,
      top_expenses: topExpenses
    };
  }

  /**
   * Get weekly report
   */
  async getWeeklyReport(userId, date) {
    const targetDate = date ? new Date(date) : new Date();

    // Get start of week (Monday)
    const startOfWeek = new Date(targetDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    // Get end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];

    // Daily breakdown
    const dailyData = await sequelize.query(`
      SELECT 
        t.transaction_date as date,
        t.type,
        SUM(t.amount) as total
      FROM transactions t
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.deleted_at IS NULL
      GROUP BY t.transaction_date, t.type
      ORDER BY t.transaction_date
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Category breakdown
    const categoryData = await sequelize.query(`
      SELECT 
        c.name as category,
        t.type,
        SUM(t.amount) as total,
        COUNT(*) as count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.deleted_at IS NULL
      GROUP BY c.id, t.type
      ORDER BY total DESC
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Recent Transactions
    const recentTransactions = await sequelize.query(`
      SELECT 
        t.id,
        t.type,
        t.amount,
        t.notes,
        t.transaction_date,
        c.name as category_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.deleted_at IS NULL
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Top Incomes (grouped by category)
    const topIncomes = await sequelize.query(`
      SELECT 
        c.name as category_name,
        SUM(t.amount) as amount,
        COUNT(*) as transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.type = 'income'
        AND t.deleted_at IS NULL
      GROUP BY c.id, c.name
      ORDER BY amount DESC
      LIMIT 5
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Top Expenses (grouped by category)
    const topExpenses = await sequelize.query(`
      SELECT 
        c.name as category_name,
        SUM(t.amount) as amount,
        COUNT(*) as transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.type = 'expense'
        AND t.deleted_at IS NULL
      GROUP BY c.id, c.name
      ORDER BY amount DESC
      LIMIT 5
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    const summary = await this.calculateSummary(userId, startDate, endDate);

    return {
      period: { start: startDate, end: endDate },
      summary,
      daily_breakdown: dailyData,
      category_breakdown: categoryData,
      recent_transactions: recentTransactions,
      top_incomes: topIncomes,
      top_expenses: topExpenses
    };
  }

  /**
   * Get monthly report
   */
  async getMonthlyReport(userId, year, month) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || (now.getMonth() + 1);

    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${lastDay}`;

    // Weekly breakdown
    const weeklyData = await sequelize.query(`
      SELECT 
        WEEK(t.transaction_date, 1) as week_number,
        MIN(t.transaction_date) as week_start,
        MAX(t.transaction_date) as week_end,
        t.type,
        SUM(t.amount) as total
      FROM transactions t
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.deleted_at IS NULL
      GROUP BY WEEK(t.transaction_date, 1), t.type
      ORDER BY week_number
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Category breakdown
    const categoryData = await sequelize.query(`
      SELECT 
        c.name as category,
        t.type,
        SUM(t.amount) as total,
        COUNT(*) as count,
        ROUND(SUM(t.amount) * 100 / (
          SELECT SUM(amount) FROM transactions 
          WHERE user_id = :userId 
            AND type = t.type 
            AND transaction_date BETWEEN :startDate AND :endDate
            AND deleted_at IS NULL
        ), 2) as percentage
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.deleted_at IS NULL
      GROUP BY c.id, t.type
      ORDER BY total DESC
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Top Income (grouped by category)
    const topIncomes = await sequelize.query(`
      SELECT 
        c.name as category_name,
        SUM(t.amount) as amount,
        COUNT(*) as transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.type = 'income'
        AND t.deleted_at IS NULL
      GROUP BY c.id, c.name
      ORDER BY amount DESC
      LIMIT 5
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Top Expenses (grouped by category)
    const topExpenses = await sequelize.query(`
      SELECT 
        c.name as category_name,
        SUM(t.amount) as amount,
        COUNT(*) as transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.type = 'expense'
        AND t.deleted_at IS NULL
      GROUP BY c.id, c.name
      ORDER BY amount DESC
      LIMIT 5
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Recent Transactions (for dashboard)
    const recentTransactions = await sequelize.query(`
      SELECT 
        t.id,
        t.type,
        t.amount,
        t.notes,
        t.transaction_date,
        c.name as category_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.deleted_at IS NULL
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    const summary = await this.calculateSummary(userId, startDate, endDate);

    return {
      period: {
        year: targetYear,
        month: targetMonth,
        start: startDate,
        end: endDate
      },
      summary,
      weekly_breakdown: weeklyData,
      category_breakdown: categoryData,
      top_incomes: topIncomes,
      top_expenses: topExpenses,
      recent_transactions: recentTransactions
    };
  }

  /**
   * Get yearly report
   */
  async getYearlyReport(userId, year) {
    const targetYear = year || new Date().getFullYear();
    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;

    // Monthly breakdown
    const monthlyData = await sequelize.query(`
      SELECT 
        MONTH(t.transaction_date) as month,
        t.type,
        SUM(t.amount) as total
      FROM transactions t
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.deleted_at IS NULL
      GROUP BY MONTH(t.transaction_date), t.type
      ORDER BY month
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Category breakdown
    const categoryData = await sequelize.query(`
      SELECT 
        c.name as category,
        t.type,
        SUM(t.amount) as total,
        COUNT(*) as count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.deleted_at IS NULL
      GROUP BY c.id, t.type
      ORDER BY total DESC
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Recent Transactions
    const recentTransactions = await sequelize.query(`
      SELECT 
        t.id,
        t.type,
        t.amount,
        t.notes,
        t.transaction_date,
        c.name as category_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.deleted_at IS NULL
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 10
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Top Incomes (grouped by category)
    const topIncomes = await sequelize.query(`
      SELECT 
        c.name as category_name,
        SUM(t.amount) as amount,
        COUNT(*) as transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.type = 'income'
        AND t.deleted_at IS NULL
      GROUP BY c.id, c.name
      ORDER BY amount DESC
      LIMIT 5
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    // Top Expenses (grouped by category)
    const topExpenses = await sequelize.query(`
      SELECT 
        c.name as category_name,
        SUM(t.amount) as amount,
        COUNT(*) as transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = :userId 
        AND t.transaction_date BETWEEN :startDate AND :endDate
        AND t.type = 'expense'
        AND t.deleted_at IS NULL
      GROUP BY c.id, c.name
      ORDER BY amount DESC
      LIMIT 5
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    const summary = await this.calculateSummary(userId, startDate, endDate);

    return {
      period: {
        year: targetYear,
        start: startDate,
        end: endDate
      },
      summary,
      monthly_breakdown: monthlyData,
      category_breakdown: categoryData,
      recent_transactions: recentTransactions,
      top_incomes: topIncomes,
      top_expenses: topExpenses
    };
  }

  /**
   * Get overall summary (filtered by current month)
   */
  async getSummary(userId) {
    // Get current month start and end dates
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

    const result = await sequelize.query(`
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE user_id = :userId 
        AND deleted_at IS NULL
        AND transaction_date >= :startDate
        AND transaction_date <= :endDate
      GROUP BY type
    `, {
      replacements: { userId, startDate: startOfMonth, endDate: endOfMonth },
      type: QueryTypes.SELECT
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    result.forEach(r => {
      if (r.type === 'income') {
        totalIncome = parseFloat(r.total) || 0;
        incomeCount = parseInt(r.count) || 0;
      } else {
        totalExpense = parseFloat(r.total) || 0;
        expenseCount = parseInt(r.count) || 0;
      }
    });

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      income_count: incomeCount,
      expense_count: expenseCount,
      total_transactions: incomeCount + expenseCount
    };
  }

  /**
   * Helper: Calculate summary for date range
   */
  async calculateSummary(userId, startDate, endDate) {
    const result = await sequelize.query(`
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE user_id = :userId 
        AND transaction_date BETWEEN :startDate AND :endDate
        AND deleted_at IS NULL
      GROUP BY type
    `, {
      replacements: { userId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    result.forEach(r => {
      if (r.type === 'income') {
        totalIncome = parseFloat(r.total) || 0;
        incomeCount = parseInt(r.count) || 0;
      } else {
        totalExpense = parseFloat(r.total) || 0;
        expenseCount = parseInt(r.count) || 0;
      }
    });

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      income_count: incomeCount,
      expense_count: expenseCount
    };
  }
}

module.exports = new ReportService();
