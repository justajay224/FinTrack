"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { formatCurrency, formatDate } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // keeping for future actions
import { ArrowUpRight, ArrowDownRight, MoreVertical, Trash2, Edit2 } from "lucide-react" // Changed Edit to Edit2
import { cn } from "@/lib/utils"

interface Transaction {
    id: number
    amount: string
    type: 'income' | 'expense'
    category?: { name: string } // Added nested category support
    category_name?: string // Backwards compatibility
    transaction_date: string
    notes: string
    category_id?: number // Added for edit form
}

interface TransactionListProps {
    transactions: Transaction[]
    isLoading: boolean
    onEdit: (transaction: Transaction) => void
    onDelete: (id: number) => void
}

export function TransactionList({ transactions, isLoading, onEdit, onDelete }: TransactionListProps) {
    if (isLoading) {
        return <div className="text-center py-10 text-gray-400">Loading transactions...</div>
    }

    if (transactions.length === 0) {
        return <div className="text-center py-10 text-gray-400">No transactions found. Start adding one!</div>
    }

    return (
        <div className="space-y-4">
            {transactions.map((transaction, index) => (
                <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center bg-opacity-20",
                            transaction.type === 'income' ? "bg-emerald-500 text-emerald-400" : "bg-rose-500 text-rose-400"
                        )}>
                            {transaction.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div>
                            <p className="font-medium text-white">
                                {transaction.category?.name || transaction.category_name || "Uncategorized"}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{formatDate(transaction.transaction_date)}</span>
                                {transaction.notes && (
                                    <>
                                        <span>•</span>
                                        <span>{transaction.notes}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={cn(
                            "font-bold",
                            transaction.type === 'income' ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(parseFloat(transaction.amount))}
                        </span>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onEdit(transaction)}
                                className="p-2 rounded-lg hover:bg-violet-500/20 text-gray-400 hover:text-violet-400 transition-colors"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(transaction.id)}
                                className="p-2 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
