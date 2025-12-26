"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import api from "@/lib/api"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

interface Category {
    id: number
    name: string
    type: 'income' | 'expense'
    is_default: boolean
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
    const [newCategoryName, setNewCategoryName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; category: Category | null }>({ show: false, category: null })
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/categories')
            if (response.data.success) {
                setCategories(response.data.data?.categories || response.data.data || [])
            }
        } catch (error) {
            toast.error('Failed to load categories')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategoryName.trim()) return

        setIsCreating(true)
        try {
            const response = await api.post('/categories', {
                name: newCategoryName.trim(),
                type: activeTab
            })
            if (response.data.success) {
                toast.success(`Category "${newCategoryName}" created!`)
                setNewCategoryName("")
                fetchCategories()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create category')
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.category) return

        setIsDeleting(true)
        try {
            await api.delete(`/categories/${deleteConfirm.category.id}`)
            toast.success(`Category "${deleteConfirm.category.name}" deleted`)
            fetchCategories()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete category')
        } finally {
            setIsDeleting(false)
            setDeleteConfirm({ show: false, category: null })
        }
    }

    const filteredCategories = categories.filter(c => c.type === activeTab)
    const defaultCategories = filteredCategories.filter(c => c.is_default)
    const customCategories = filteredCategories.filter(c => !c.is_default)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Categories</h1>
                <p className="text-gray-400">Manage your income and expense categories</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10 w-fit">
                <button
                    onClick={() => setActiveTab('expense')}
                    className={cn(
                        "px-6 py-2 text-sm font-medium rounded-md transition-all",
                        activeTab === 'expense' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    Expense
                </button>
                <button
                    onClick={() => setActiveTab('income')}
                    className={cn(
                        "px-6 py-2 text-sm font-medium rounded-md transition-all",
                        activeTab === 'income' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    Income
                </button>
            </div>

            {/* Add New Category */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-lg">Add New Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateCategory} className="flex gap-3">
                        <Input
                            placeholder="Enter category name..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 bg-white/5 border-white/10 text-white"
                        />
                        <Button
                            type="submit"
                            disabled={isCreating || !newCategoryName.trim()}
                            className={cn(
                                "text-white",
                                activeTab === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                            )}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {isCreating ? 'Adding...' : 'Add Category'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Custom Categories */}
            {customCategories.length > 0 && (
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Custom Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {customCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors"
                                >
                                    <span className="text-white font-medium">{category.name}</span>
                                    <button
                                        onClick={() => setDeleteConfirm({ show: true, category })}
                                        className="p-1.5 rounded-md text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Default Categories */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Default Categories
                        <span className="text-xs text-gray-500 font-normal ml-2">(Cannot be deleted)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-gray-400">Loading...</p>
                    ) : (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {defaultCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center p-3 rounded-lg bg-white/5 border border-white/10"
                                >
                                    <span className="text-gray-300">{category.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, category: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteConfirm.category?.name}"? This category will be removed from the list, but existing transactions will keep this category name.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    )
}
