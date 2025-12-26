"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, LogOut, Trash2, X } from "lucide-react"
import { Button } from "./button"

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'logout'
    isLoading?: boolean
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'danger',
    isLoading = false
}: ConfirmDialogProps) {
    if (!isOpen) return null

    const getIcon = () => {
        switch (variant) {
            case 'logout':
                return <LogOut className="h-6 w-6" />
            case 'warning':
                return <AlertTriangle className="h-6 w-6" />
            default:
                return <Trash2 className="h-6 w-6" />
        }
    }

    const getColors = () => {
        switch (variant) {
            case 'logout':
                return {
                    iconBg: 'bg-violet-500/20',
                    iconColor: 'text-violet-400',
                    buttonBg: 'bg-violet-600 hover:bg-violet-700',
                    ring: 'ring-violet-500/30'
                }
            case 'warning':
                return {
                    iconBg: 'bg-amber-500/20',
                    iconColor: 'text-amber-400',
                    buttonBg: 'bg-amber-600 hover:bg-amber-700',
                    ring: 'ring-amber-500/30'
                }
            default:
                return {
                    iconBg: 'bg-rose-500/20',
                    iconColor: 'text-rose-400',
                    buttonBg: 'bg-rose-600 hover:bg-rose-700',
                    ring: 'ring-rose-500/30'
                }
        }
    }

    const colors = getColors()

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Dialog */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    className={`relative bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden ring-1 ${colors.ring}`}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Content */}
                    <div className="p-6">
                        {/* Icon */}
                        <div className={`mx-auto w-14 h-14 rounded-full ${colors.iconBg} flex items-center justify-center mb-4`}>
                            <span className={colors.iconColor}>
                                {getIcon()}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-white text-center mb-2">
                            {title}
                        </h3>

                        {/* Message */}
                        <p className="text-gray-400 text-center text-sm mb-6">
                            {message}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
                                disabled={isLoading}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                onClick={onConfirm}
                                className={`flex-1 text-white ${colors.buttonBg}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : confirmText}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
