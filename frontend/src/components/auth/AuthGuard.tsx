"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import toast from "react-hot-toast"

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/transactions', '/reports', '/settings']

// Guest-only routes (redirect to dashboard if logged in)
const guestRoutes = ['/', '/login', '/register']

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
        const isGuestRoute = guestRoutes.includes(pathname)

        if (isProtected && !token) {
            // Not logged in, trying to access protected route
            toast.error('Please login to continue', { id: 'auth-required' })
            router.push('/login')
        } else if (isGuestRoute && token) {
            // Already logged in, redirect to dashboard
            router.push('/dashboard')
        } else {
            setIsLoading(false)
        }
    }, [pathname, router])

    // Show loading spinner for protected routes
    if (isLoading && (protectedRoutes.some(route => pathname.startsWith(route)) || guestRoutes.includes(pathname))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020817]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
        )
    }

    return <>{children}</>
}
