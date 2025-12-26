const reportService = require('../services/report.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class ReportController {
    /**
     * GET /api/reports/daily
     * Query: ?date=YYYY-MM-DD
     */
    async getDailyReport(req, res) {
        try {
            const report = await reportService.getDailyReport(req.user.id, req.query.date);
            return successResponse(res, 'Daily report retrieved successfully', report);
        } catch (error) {
            console.error('Daily report error:', error);
            return errorResponse(res, error.message || 'Failed to get daily report', error.status || 500);
        }
    }

    /**
     * GET /api/reports/weekly
     * Query: ?date=YYYY-MM-DD (any date in the target week)
     */
    async getWeeklyReport(req, res) {
        try {
            const report = await reportService.getWeeklyReport(req.user.id, req.query.date);
            return successResponse(res, 'Weekly report retrieved successfully', report);
        } catch (error) {
            console.error('Weekly report error:', error);
            return errorResponse(res, error.message || 'Failed to get weekly report', error.status || 500);
        }
    }

    /**
     * GET /api/reports/monthly
     * Query: ?year=YYYY&month=MM
     */
    async getMonthlyReport(req, res) {
        try {
            const { year, month } = req.query;
            const report = await reportService.getMonthlyReport(
                req.user.id,
                year ? parseInt(year) : null,
                month ? parseInt(month) : null
            );
            return successResponse(res, 'Monthly report retrieved successfully', report);
        } catch (error) {
            console.error('Monthly report error:', error);
            return errorResponse(res, error.message || 'Failed to get monthly report', error.status || 500);
        }
    }

    /**
     * GET /api/reports/summary
     * Overall summary of all transactions
     */
    async getSummary(req, res) {
        try {
            const summary = await reportService.getSummary(req.user.id);
            return successResponse(res, 'Summary retrieved successfully', summary);
        } catch (error) {
            console.error('Summary error:', error);
            return errorResponse(res, error.message || 'Failed to get summary', error.status || 500);
        }
    }

    /**
     * GET /api/reports/yearly
     * Query: ?year=YYYY
     */
    async getYearlyReport(req, res) {
        try {
            const { year } = req.query;
            const report = await reportService.getYearlyReport(
                req.user.id,
                year ? parseInt(year) : null
            );
            return successResponse(res, 'Yearly report retrieved successfully', report);
        } catch (error) {
            console.error('Yearly report error:', error);
            return errorResponse(res, error.message || 'Failed to get yearly report', error.status || 500);
        }
    }
}

module.exports = new ReportController();
