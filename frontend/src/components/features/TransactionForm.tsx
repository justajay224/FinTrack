import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, X } from "lucide-react" // Added Plus and X icons
import api from "@/lib/api"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

interface Category {
    id: number
    name: string
    type: 'income' | 'expense'
}

interface TransactionFormProps {
    onSuccess: () => void
    onCancel: () => void
    initialData?: any
}

export function TransactionForm({ onSuccess, onCancel, initialData }: TransactionFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense')
    const [formData, setFormData] = useState({
        amount: initialData?.amount || "",
        category_id: initialData?.category_id || "",
        transaction_date: initialData?.transaction_date || new Date().toISOString().split('T')[0],
        notes: initialData?.notes || ""
    })

    // Category Creation State
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [isCreatingCatLoading, setIsCreatingCatLoading] = useState(false)

    // Fetch categories on mount
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            const response = await api.get(`/categories?type=${type}`)
            if (response.data.success) {
                setCategories(response.data.data?.categories || response.data.data || [])
            }
        } catch (error) {
            toast.error("Failed to load categories")
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [type])

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return

        setIsCreatingCatLoading(true)
        try {
            const token = localStorage.getItem('accessToken')
            const payload = { name: newCategoryName, type }
            const response = await api.post('/categories', payload)

            if (response.data.success) {
                toast.success(`Category "${newCategoryName}" created!`)
                const newCat = response.data.data.category
                setCategories([...categories, newCat])
                setFormData({ ...formData, category_id: newCat.id })
                setIsCreatingCategory(false)
                setNewCategoryName("")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create category")
        } finally {
            setIsCreatingCatLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem('accessToken')
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                type,
                category_id: parseInt(formData.category_id)
            }

            if (initialData) {
                await api.put(`/transactions/${initialData.id}`, payload)
                toast.success("Transaction updated!")
            } else {
                await api.post('/transactions', payload)
                toast.success("Transaction added!")
            }
            onSuccess()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save transaction")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-xl border border-white/10 mb-6">
                <button
                    type="button"
                    onClick={() => { setType('expense'); setFormData({ ...formData, category_id: "" }) }}
                    className={cn(
                        "py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
                        type === 'expense' ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/50 shadow-lg shadow-rose-900/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    Expense
                </button>
                <button
                    type="button"
                    onClick={() => { setType('income'); setFormData({ ...formData, category_id: "" }) }}
                    className={cn(
                        "py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
                        type === 'income' ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-900/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    Income
                </button>
            </div>

            <div className="space-y-4">
                <Input
                    type="number"
                    label="Amount"
                    placeholder="0"
                    leftAddon={<span className="font-semibold text-white/50">Rp</span>}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="1"
                    className="bg-white/5 border-white/10 text-lg font-semibold tracking-wide"
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Category</label>

                    {!isCreatingCategory ? (
                        <div className="space-y-2">
                            <select
                                value={formData.category_id}
                                onChange={(e) => {
                                    if (e.target.value === 'new') {
                                        setIsCreatingCategory(true)
                                    } else {
                                        setFormData({ ...formData, category_id: e.target.value })
                                    }
                                }}
                                required
                                className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none transition-all"
                            >
                                <option value="" className="bg-gray-900 text-gray-400">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id} className="bg-gray-900">
                                        {cat.name}
                                    </option>
                                ))}
                                <option value="new" className="bg-gray-900 font-medium text-violet-400">
                                    + Create New "{type}" Category
                                </option>
                            </select>
                        </div>
                    ) : (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                            <Input
                                placeholder="New Category Name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                autoFocus
                                className="bg-white/5 border-white/10"
                            />
                            <Button
                                type="button"
                                size="icon"
                                onClick={handleCreateCategory}
                                disabled={!newCategoryName.trim() || isCreatingCatLoading}
                                className="bg-violet-600 hover:bg-violet-700 shrink-0"
                            >
                                {isCreatingCatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => { setIsCreatingCategory(false); setNewCategoryName("") }}
                                className="hover:bg-white/10 text-gray-400 shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="date"
                        label="Date"
                        value={formData.transaction_date}
                        max={new Date().toISOString().split('T')[0]} // Restricted to today
                        onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                        required
                        className="bg-white/5 border-white/10"
                    />
                    <Input
                        label="Notes"
                        placeholder="Optional"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="bg-white/5 border-white/10"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <Button variant="ghost" type="button" onClick={onCancel} className="hover:bg-white/5">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "min-w-[120px] shadow-lg shadow-black/20",
                        type === 'income'
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                            : "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400"
                    )}
                >
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Transaction"}
                </Button>
            </div>
        </form>
    )
}
