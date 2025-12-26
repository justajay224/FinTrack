"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DailyReportChart, CategoryReportChart } from "@/components/features/ReportCharts"
import { formatCurrency } from "@/lib/utils"
import { Calendar, TrendingUp, TrendingDown } from "lucide-react"

type FilterType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export default function ReportsPage() {
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('monthly')
    const [reportData, setReportData] = useState<any>(null)

    useEffect(() => {
        fetchReportData()
    }, [filter])

    const fetchReportData = async () => {
        setLoading(true)
        try {
            let res
            if (filter === 'daily') {
                res = await api.get('/reports/daily')
            } else if (filter === 'weekly') {
                res = await api.get('/reports/weekly')
            } else if (filter === 'yearly') {
                res = await api.get(`/reports/yearly?year=${new Date().getFullYear()}`)
            } else {
                res = await api.get(`/reports/monthly?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`)
            }

            if (res.data.success) {
                setReportData(res.data.data)
            }
        } catch (error) {
            toast.error("Failed to load reports")
        } finally {
            setLoading(false)
        }
    }

    // Color Palettes
    const expenseColors = [
        '#ef4444', '#f97316', '#eab308', '#db2777', '#fb923c',
        '#f87171', '#c084fc', '#fcd34d', '#f472b6', '#fda4af',
    ]

    const incomeColors = [
        '#10b981', '#06b6d4', '#3b82f6', '#84cc16', '#14b8a6',
        '#6366f1', '#22c55e', '#0ea5e9', '#a855f7', '#ec4899',
    ]

    // Process chart data based on filter
    const processTrendChartData = () => {
        if (!reportData) return null

        if (filter === 'daily') {
            // Daily has no breakdown chart, show category breakdown instead
            return null
        }

        if (filter === 'weekly' && reportData.daily_breakdown) {
            const uniqueDates = Array.from(new Set(reportData.daily_breakdown.map((d: any) => d.date))).sort()
            return {
                labels: uniqueDates.map((date: any) => new Date(date).toLocaleDateString(undefined, { weekday: 'short' })),
                datasets: [
                    {
                        label: 'Income',
                        data: uniqueDates.map((date: any) => {
                            const item = reportData.daily_breakdown.find((d: any) => d.date === date && d.type === 'income')
                            return item ? parseFloat(item.total) : 0
                        }),
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                    },
                    {
                        label: 'Expense',
                        data: uniqueDates.map((date: any) => {
                            const item = reportData.daily_breakdown.find((d: any) => d.date === date && d.type === 'expense')
                            return item ? parseFloat(item.total) : 0
                        }),
                        borderColor: '#f43f5e',
                        backgroundColor: '#f43f5e',
                    }
                ]
            }
        }

        if (filter === 'monthly' && reportData.weekly_breakdown) {
            // Get unique week numbers
            const uniqueWeeks = [...new Set(reportData.weekly_breakdown.map((w: any) => w.week_number))].sort((a: any, b: any) => a - b)
            return {
                labels: uniqueWeeks.map((weekNum: any) => `Week ${weekNum}`),
                datasets: [
                    {
                        label: 'Income',
                        data: uniqueWeeks.map((weekNum: any) => {
                            const item = reportData.weekly_breakdown.find((d: any) => d.week_number === weekNum && d.type === 'income')
                            return item ? parseFloat(item.total) : 0
                        }),
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                    },
                    {
                        label: 'Expense',
                        data: uniqueWeeks.map((weekNum: any) => {
                            const item = reportData.weekly_breakdown.find((d: any) => d.week_number === weekNum && d.type === 'expense')
                            return item ? parseFloat(item.total) : 0
                        }),
                        borderColor: '#f43f5e',
                        backgroundColor: '#f43f5e',
                    }
                ]
            }
        }

        if (filter === 'yearly' && reportData.monthly_breakdown) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            return {
                labels: months,
                datasets: [
                    {
                        label: 'Income',
                        data: months.map((_, i) => {
                            const item = reportData.monthly_breakdown.find((d: any) => d.month === (i + 1) && d.type === 'income')
                            return item ? parseFloat(item.total) : 0
                        }),
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                    },
                    {
                        label: 'Expense',
                        data: months.map((_, i) => {
                            const item = reportData.monthly_breakdown.find((d: any) => d.month === (i + 1) && d.type === 'expense')
                            return item ? parseFloat(item.total) : 0
                        }),
                        borderColor: '#f43f5e',
                        backgroundColor: '#f43f5e',
                    }
                ]
            }
        }

        return null
    }

    const trendChartData = processTrendChartData()

    // Pie Charts
    const expenseChartData = reportData?.category_breakdown ? {
        labels: reportData.category_breakdown.filter((c: any) => c.type === 'expense').map((c: any) => c.category),
        datasets: [{
            data: reportData.category_breakdown.filter((c: any) => c.type === 'expense').map((c: any) => parseFloat(c.total)),
            backgroundColor: expenseColors,
            borderWidth: 0,
        }],
    } : null

    const incomeChartData = reportData?.category_breakdown ? {
        labels: reportData.category_breakdown.filter((c: any) => c.type === 'income').map((c: any) => c.category),
        datasets: [{
            data: reportData.category_breakdown.filter((c: any) => c.type === 'income').map((c: any) => parseFloat(c.total)),
            backgroundColor: incomeColors,
            borderWidth: 0,
        }],
    } : null

    const getFilterLabel = () => {
        switch (filter) {
            case 'daily': return 'Today'
            case 'weekly': return 'This Week'
            case 'monthly': return new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
            case 'yearly': return `Year ${new Date().getFullYear()}`
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Reports & Analytics</h1>
                    <p className="text-gray-400 mt-1">
                        <Calendar className="inline-block h-4 w-4 mr-1" />
                        {getFilterLabel()}
                    </p>
                </div>

                {/* Filter Controls */}
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === f ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {f === 'daily' ? 'Today' : f === 'weekly' ? 'Week' : f === 'monthly' ? 'Month' : 'Year'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-white text-center py-10">Loading reports...</div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-gray-400">Total Income</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    {formatCurrency(reportData?.summary?.total_income || 0)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-gray-400">Total Expense</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-rose-400 flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5" />
                                    {formatCurrency(reportData?.summary?.total_expense || 0)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-gray-400">Net Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${(reportData?.summary?.balance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formatCurrency(reportData?.summary?.balance || 0)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Trend Chart (not for daily) */}
                    {trendChartData && (
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>
                                    {filter === 'weekly' ? 'Daily Breakdown' : filter === 'monthly' ? 'Weekly Breakdown' : 'Monthly Breakdown'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DailyReportChart data={trendChartData} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Pie Charts Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-emerald-400">Income Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                {incomeChartData && incomeChartData.datasets[0].data.length > 0 ? (
                                    <div className="w-[80%]"><CategoryReportChart data={incomeChartData} /></div>
                                ) : (
                                    <p className="text-gray-400 py-10">No income data available</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-rose-400">Expense Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                {expenseChartData && expenseChartData.datasets[0].data.length > 0 ? (
                                    <div className="w-[80%]"><CategoryReportChart data={expenseChartData} /></div>
                                ) : (
                                    <p className="text-gray-400 py-10">No expense data available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Tables Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-emerald-400">Top Income Sources</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-white text-sm text-left">
                                        <thead className="text-gray-400 border-b border-white/10">
                                            <tr>
                                                <th className="py-2">Category</th>
                                                <th className="py-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData?.top_incomes?.map((t: any, idx: number) => (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-2">{t.category_name}</td>
                                                    <td className="py-2 text-right font-medium text-emerald-400">
                                                        +{formatCurrency(parseFloat(t.amount))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!reportData?.top_incomes?.length && <p className="text-gray-400 text-center py-4">No income transactions found</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-rose-400">Top Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-white text-sm text-left">
                                        <thead className="text-gray-400 border-b border-white/10">
                                            <tr>
                                                <th className="py-2">Category</th>
                                                <th className="py-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData?.top_expenses?.map((t: any, idx: number) => (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-2">{t.category_name}</td>
                                                    <td className="py-2 text-right font-medium text-rose-400">
                                                        -{formatCurrency(parseFloat(t.amount))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!reportData?.top_expenses?.length && <p className="text-gray-400 text-center py-4">No expense transactions found</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* History Transactions for all filters */}
                    {reportData?.recent_transactions && (
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>History Transaction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto max-h-[220px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-white text-sm text-left">
                                        <thead className="text-gray-400 border-b border-white/10">
                                            <tr>
                                                <th className="py-2">Category</th>
                                                <th className="py-2">Notes</th>
                                                <th className="py-2">Date</th>
                                                <th className="py-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.recent_transactions.map((t: any) => (
                                                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-2">{t.category_name}</td>
                                                    <td className="py-2 text-gray-400 truncate max-w-[150px]">{t.notes || '-'}</td>
                                                    <td className="py-2 text-gray-400">{new Date(t.transaction_date).toLocaleDateString()}</td>
                                                    <td className={`py-2 text-right font-medium ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!reportData.recent_transactions?.length && <p className="text-gray-400 text-center py-4">No transactions found</p>}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
