"use client"

import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api'

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token!)
        }
    })
    failedQueue = []
}

// Request interceptor - add token to every request
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - handle 401 errors with auto-refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Check if we have a refresh token
            if (typeof window !== 'undefined') {
                const refreshToken = localStorage.getItem('refreshToken')

                // No refresh token = go to login
                if (!refreshToken) {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('user')
                    toast.error('Sesi Anda telah berakhir. Silakan login kembali.', {
                        duration: 4000,
                        id: 'session-expired'
                    })
                    setTimeout(() => {
                        window.location.href = '/login'
                    }, 1000)
                    return Promise.reject(error)
                }

                // If already refreshing, queue this request
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject })
                    })
                        .then((token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                            return api(originalRequest)
                        })
                        .catch((err) => Promise.reject(err))
                }

                originalRequest._retry = true
                isRefreshing = true

                try {
                    // Call refresh token endpoint
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken
                    })

                    if (response.data.success) {
                        const newAccessToken = response.data.data.accessToken
                        localStorage.setItem('accessToken', newAccessToken)

                        // Process queued requests
                        processQueue(null, newAccessToken)

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                        return api(originalRequest)
                    }
                } catch (refreshError) {
                    // Refresh failed - clear tokens and redirect
                    processQueue(refreshError, null)
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('user')

                    toast.error('Sesi Anda telah berakhir. Silakan login kembali.', {
                        duration: 4000,
                        id: 'session-expired'
                    })

                    setTimeout(() => {
                        window.location.href = '/login'
                    }, 1000)

                    return Promise.reject(refreshError)
                } finally {
                    isRefreshing = false
                }
            }
        }

        return Promise.reject(error)
    }
)

export default api
