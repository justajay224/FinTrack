"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, Activity, PieChart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { TransactionForm } from "@/components/features/TransactionForm"
import { CategoryReportChart } from "@/components/features/ReportCharts"
import api from "@/lib/api"
import { formatCurrency, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

interface Transaction {
    id: number
    type: 'income' | 'expense'
    amount: string
    category_name: string
    transaction_date: string
    notes: string
}

interface CategoryData {
    category: string
    total: string
    type: 'income' | 'expense'
}

interface SummaryData {
    total_income: number
    total_expense: number
    balance: number
    transaction_count: number
    income_count: number
    expense_count: number
}

export default function DashboardPage() {
    const [user, setUser] = useState<{ name: string } | null>(null)
    const [currentMonthName, setCurrentMonthName] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Data States
    const [globalSummary, setGlobalSummary] = useState<SummaryData | null>(null) // For Net Worth
    const [periodSummary, setPeriodSummary] = useState<SummaryData | null>(null) // For Income/Expense Cards
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
    const [categoryData, setCategoryData] = useState<any>(null)

    // Filter State
    const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly'>('monthly')

    useEffect(() => {
        // Get user from local storage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }

        const date = new Date()
        setCurrentMonthName(date.toLocaleString('default', { month: 'long', year: 'numeric' }))

        // Initial fetch for global summary (Net Worth)
        fetchGlobalSummary()
    }, [])

    // Fetch data whenever filter changes
    useEffect(() => {
        fetchReportData()
    }, [filter])

    const fetchGlobalSummary = async () => {
        try {
            const res = await api.get('/reports/summary')
            if (res.data.success) {
                setGlobalSummary(res.data.data)
            }
        } catch (error) {
            console.error('Failed to fetch global summary:', error)
        }
    }

    const fetchReportData = async () => {
        setIsLoading(true)
        try {
            let res;
            if (filter === 'daily') {
                res = await api.get('/reports/daily')
            } else if (filter === 'weekly') {
                res = await api.get('/reports/weekly')
            } else {
                res = await api.get(`/reports/monthly?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`)
            }

            if (res.data.success) {
                const data = res.data.data
                setPeriodSummary(data.summary)

                // Process chart data
                const expenseCategories = data.category_breakdown.filter((c: CategoryData) => c.type === 'expense')

                // Vibrant Warm Colors for Expenses
                const expenseColors = [
                    '#ef4444', '#f97316', '#eab308', '#db2777', '#fb923c',
                    '#f87171', '#c084fc', '#fcd34d', '#f472b6', '#fda4af'
                ];

                const chartConfig = {
                    labels: expenseCategories.map((c: CategoryData) => c.category),
                    datasets: [
                        {
                            data: expenseCategories.map((c: CategoryData) => parseFloat(c.total)),
                            backgroundColor: expenseColors,
                            borderColor: 'transparent',
                            borderWidth: 0,
                        },
                    ],
                }
                setCategoryData(chartConfig)

                // Use recent_transactions (standardized across endpoints)
                setRecentTransactions(data.recent_transactions || [])
            }
        } catch (error) {
            console.error('Failed to fetch report data:', error)
            toast.error('Failed to load report data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleTransactionAdded = () => {
        setIsModalOpen(false)
        fetchGlobalSummary()
        fetchReportData()
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-8 pb-10"
        >
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-gray-400">
                        Overview for <span className="text-violet-400 font-medium">{currentMonthName}</span>
                    </p>
                </div>

                {/* Quick Add Button */}
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/20"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Quick Transaction
                </Button>
            </motion.div>

            {/* Summary Cards */}
            <motion.div variants={item} className="grid gap-4 md:grid-cols-3">
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent group-hover:from-violet-600/20 transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Total Balance</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                            <Wallet className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {globalSummary ? formatCurrency(globalSummary.balance) : "Rp 0"}
                        </div>
                        <p className="text-xs text-violet-300/60 mt-1">Net Worth</p>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent group-hover:from-emerald-600/20 transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Income ({filter === 'daily' ? 'Today' : filter === 'weekly' ? 'This Week' : 'This Month'})
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {periodSummary ? formatCurrency(periodSummary.total_income) : "Rp 0"}
                        </div>
                        <div className="flex items-center text-xs text-emerald-300/60 mt-1">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            {periodSummary?.income_count || 0} transactions
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 to-transparent group-hover:from-rose-600/20 transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Expense ({filter === 'daily' ? 'Today' : filter === 'weekly' ? 'This Week' : 'This Month'})
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                            <TrendingDown className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {periodSummary ? formatCurrency(periodSummary.total_expense) : "Rp 0"}
                        </div>
                        <div className="flex items-center text-xs text-rose-300/60 mt-1">
                            <ArrowDownRight className="mr-1 h-3 w-3" />
                            {periodSummary?.expense_count || 0} transactions
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <motion.div variants={item} className="col-span-4 space-y-4">
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-indigo-400" />
                                    Recent Activity
                                </CardTitle>
                                <p className="text-xs text-gray-400">
                                    Latest transactions ({filter === 'daily' ? 'Today' : filter === 'weekly' ? 'This Week' : 'This Month'})
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-10 text-gray-500">Loading...</div>
                            ) : recentTransactions.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">No transactions found</div>
                            ) : (
                                <div className="space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-2">
                                    {recentTransactions.map((t) => (
                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`h - 8 w - 8 rounded - full flex items - center justify - center bg - opacity - 20 ${t.type === 'income' ? 'bg-emerald-500 text-emerald-400' : 'bg-rose-500 text-rose-400'} `}>
                                                    {t.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{t.category_name}</p>
                                                    <p className="text-xs text-gray-400">{formatDate(t.transaction_date)}</p>
                                                </div>
                                            </div>
                                            <span className={`text - sm font - bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'} `}>
                                                {t.type === 'income' ? '+' : '-'} {formatCurrency(parseFloat(t.amount))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Expenses Breakdown Chart with Filters */}
                <motion.div variants={item} className="col-span-3 space-y-4">
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-full">
                        <CardHeader className="flex flex-col gap-4">
                            <div className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <PieChart className="h-4 w-4 text-violet-400" />
                                    Expenses Breakdown
                                </CardTitle>
                            </div>

                            {/* Filter Controls */}
                            <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                                <button
                                    onClick={() => setFilter('daily')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'daily' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setFilter('weekly')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'weekly' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => setFilter('monthly')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'monthly' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Month
                                </button>
                            </div>

                            <p className="text-xs text-gray-400">
                                {filter === 'daily' && "Where your money went Today"}
                                {filter === 'weekly' && "Where your money went This Week"}
                                {filter === 'monthly' && `Where your money went in ${currentMonthName} `}
                            </p>
                        </CardHeader>
                        <CardContent className="flex justify-center items-center min-h-[250px]">
                            {isLoading ? (
                                <div className="text-gray-500">Loading chart...</div>
                            ) : categoryData && categoryData.datasets[0].data.length > 0 ? (
                                <div className="w-[80%] rounded-xl overflow-hidden">
                                    <CategoryReportChart data={categoryData} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                    <PieChart className="h-10 w-10 mb-2 opacity-20" />
                                    <p className="text-sm">No expense data</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Quick Transaction"
            >
                <TransactionForm
                    onSuccess={handleTransactionAdded}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </motion.div>
    )
}
