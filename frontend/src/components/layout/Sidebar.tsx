"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Receipt, BarChart3, LogOut, Wallet, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import toast from "react-hot-toast"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Transactions",
        href: "/dashboard/transactions",
        icon: Receipt,
    },
    {
        title: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    // Prevent scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMobileMenuOpen])

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        toast.success('Logged out successfully')
        router.push('/')
    }

    const SidebarContent = () => (
        <>
            <div className="flex items-center gap-2 px-2 py-6 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                    FinTrack
                </span>
            </div>

            <nav className="space-y-2 flex-1">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                            pathname === item.href
                                ? "text-white bg-white/10 shadow-lg shadow-violet-500/10 border border-white/5"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {pathname === item.href && (
                            <div className="absolute left-0 top-0 h-full w-1 bg-violet-500 rounded-r-full" />
                        )}
                        <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-violet-400" : "text-gray-500 group-hover:text-gray-300")} />
                        {item.title}
                    </Link>
                ))}
            </nav>

            <div className="pt-4 border-t border-white/10">
                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                        FinTrack
                    </span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-black/95 backdrop-blur-xl border-r border-white/10 z-40 flex flex-col p-4 transition-transform duration-300",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <SidebarContent />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex h-screen w-64 border-r border-white/10 bg-black/20 backdrop-blur-xl fixed left-0 top-0 flex-col p-4 z-50">
                <SidebarContent />
            </div>

            <ConfirmDialog
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Logout"
                message="Are you sure you want to logout? You will need to login again to access your account."
                confirmText="Yes, Logout"
                cancelText="Cancel"
                variant="logout"
            />
        </>
    )
}
