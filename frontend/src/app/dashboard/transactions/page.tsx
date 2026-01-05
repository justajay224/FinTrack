"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { TransactionForm } from "@/components/features/TransactionForm"
import { TransactionList } from "@/components/features/TransactionList"
import api from "@/lib/api"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

interface Category {
    id: number
    name: string
    type: 'income' | 'expense'
    is_default: boolean
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<any>(undefined)
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({ show: false, id: null })
    const [isDeleting, setIsDeleting] = useState(false)

    // Categories state
    const [categories, setCategories] = useState<Category[]>([])
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense')
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)
    const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{ show: boolean; category: Category | null }>({ show: false, category: null })
    const [isDeletingCategory, setIsDeletingCategory] = useState(false)

    const fetchTransactions = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) return

            const response = await api.get('/transactions?page=1&limit=50')

            if (response.data.success) {
                setTransactions(response.data.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error)
            toast.error('Failed to load transactions')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/categories')
            if (response.data.success) {
                setCategories(response.data.data?.categories || response.data.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch categories')
        }
    }, [])

    useEffect(() => {
        fetchTransactions()
        fetchCategories()
    }, [fetchTransactions, fetchCategories])

    const handleDeleteClick = (id: number) => {
        setDeleteConfirm({ show: true, id })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.id) return

        setIsDeleting(true)
        try {
            await api.delete(`/transactions/${deleteConfirm.id}`)
            toast.success('Transaction deleted successfully')
            fetchTransactions()
        } catch (error) {
            toast.error('Failed to delete transaction')
        } finally {
            setIsDeleting(false)
            setDeleteConfirm({ show: false, id: null })
        }
    }

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategoryName.trim()) return

        setIsCreatingCategory(true)
        try {
            const response = await api.post('/categories', {
                name: newCategoryName.trim(),
                type: newCategoryType
            })
            if (response.data.success) {
                toast.success(`Category "${newCategoryName}" created!`)
                setNewCategoryName("")
                fetchCategories()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create category')
        } finally {
            setIsCreatingCategory(false)
        }
    }

    const handleDeleteCategoryConfirm = async () => {
        if (!deleteCategoryConfirm.category) return

        setIsDeletingCategory(true)
        try {
            await api.delete(`/categories/${deleteCategoryConfirm.category.id}`)
            toast.success(`Category "${deleteCategoryConfirm.category.name}" deleted`)
            fetchCategories()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete category')
        } finally {
            setIsDeletingCategory(false)
            setDeleteCategoryConfirm({ show: false, category: null })
        }
    }

    // Filter only custom categories (non-default)
    const customCategories = categories.filter(c => !c.is_default)
    const incomeCategories = customCategories.filter(c => c.type === 'income')
    const expenseCategories = customCategories.filter(c => c.type === 'expense')

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
                    <p className="text-gray-400">Manage your income and expenses</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedTransaction(undefined)
                        setIsModalOpen(true)
                    }}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Transaction
                </Button>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* History - Takes 2 columns */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl lg:col-span-2">
                    <CardHeader>
                        <CardTitle>History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                            <TransactionList
                                transactions={transactions}
                                isLoading={isLoading}
                                onEdit={(t) => {
                                    setSelectedTransaction(t)
                                    setIsModalOpen(true)
                                }}
                                onDelete={handleDeleteClick}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Custom Categories - Takes 1 column */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Custom Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Add Category Form */}
                        <form onSubmit={handleCreateCategory} className="space-y-3">
                            <Input
                                placeholder="New category name..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white text-sm"
                            />
                            <div className="flex gap-2">
                                <select
                                    value={newCategoryType}
                                    onChange={(e) => setNewCategoryType(e.target.value as 'income' | 'expense')}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                                >
                                    <option value="expense" className="bg-gray-900">Expense</option>
                                    <option value="income" className="bg-gray-900">Income</option>
                                </select>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isCreatingCategory || !newCategoryName.trim()}
                                    className="bg-violet-600 hover:bg-violet-700 text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </form>

                        {/* Custom Categories List */}
                        {customCategories.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                                No custom categories yet
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {/* Expense Categories */}
                                {expenseCategories.length > 0 && (
                                    <div>
                                        <p className="text-xs text-rose-400 font-medium mb-2">Expense</p>
                                        <div className="space-y-1">
                                            {expenseCategories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className="flex items-center justify-between p-2 rounded-md bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="text-sm text-white">{cat.name}</span>
                                                    <button
                                                        onClick={() => setDeleteCategoryConfirm({ show: true, category: cat })}
                                                        className="p-1 rounded text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Income Categories */}
                                {incomeCategories.length > 0 && (
                                    <div>
                                        <p className="text-xs text-emerald-400 font-medium mb-2">Income</p>
                                        <div className="space-y-1">
                                            {incomeCategories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className="flex items-center justify-between p-2 rounded-md bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="text-sm text-white">{cat.name}</span>
                                                    <button
                                                        onClick={() => setDeleteCategoryConfirm({ show: true, category: cat })}
                                                        className="p-1 rounded text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedTransaction(undefined)
                }}
                title={selectedTransaction ? "Edit Transaction" : "Add Transaction"}
            >
                <TransactionForm
                    initialData={selectedTransaction}
                    onSuccess={() => {
                        setIsModalOpen(false)
                        setSelectedTransaction(undefined)
                        fetchTransactions()
                    }}
                    onCancel={() => {
                        setIsModalOpen(false)
                        setSelectedTransaction(undefined)
                    }}
                />
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, id: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={isDeleting}
            />

            <ConfirmDialog
                isOpen={deleteCategoryConfirm.show}
                onClose={() => setDeleteCategoryConfirm({ show: false, category: null })}
                onConfirm={handleDeleteCategoryConfirm}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteCategoryConfirm.category?.name}"? Existing transactions will keep this category name.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={isDeletingCategory}
            />
        </div>
    )
}
