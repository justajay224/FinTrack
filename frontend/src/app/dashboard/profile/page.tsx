"use client"

import { useState, useEffect, useCallback } from "react"
import { User, Lock, Save, LogOut, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import api from "@/lib/api"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface UserProfile {
    id: number
    name: string
    email: string
    is_active: boolean
    createdAt: string
}

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Edit Profile State
    const [editName, setEditName] = useState("")
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

    // Change Password State
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    // Password Visibility State
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Delete Account State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deletePassword, setDeletePassword] = useState("")

    const fetchProfile = useCallback(async () => {
        try {
            const response = await api.get('/users/profile')
            if (response.data.success) {
                const userData = response.data.data?.user || response.data.data
                setProfile(userData)
                setEditName(userData.name)
            }
        } catch (error) {
            toast.error('Failed to load profile')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editName.trim()) {
            toast.error('Name cannot be empty')
            return
        }

        setIsUpdatingProfile(true)
        try {
            const response = await api.put('/users/profile', { name: editName.trim() })
            if (response.data.success) {
                toast.success('Profile updated successfully!')
                // Update local storage
                const storedUser = localStorage.getItem('user')
                if (storedUser) {
                    const user = JSON.parse(storedUser)
                    user.name = editName.trim()
                    localStorage.setItem('user', JSON.stringify(user))
                }
                fetchProfile()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile')
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill all password fields')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        setIsChangingPassword(true)
        try {
            const response = await api.put('/users/password', {
                currentPassword,
                newPassword,
                confirmPassword
            })
            if (response.data.success) {
                toast.success('Password changed successfully!')
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to change password')
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            // Ignore logout errors
        } finally {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            toast.success('Logged out successfully')
            router.push('/login')
        }
    }

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error('Please enter your password')
            return
        }
        setIsDeleting(true)
        try {
            const response = await api.delete('/users/account', {
                data: { password: deletePassword }
            })
            if (response.data.success) {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
                toast.success('Account deleted successfully')
                router.push('/login')
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete account')
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
            setDeletePassword("")
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
                <p className="text-gray-400">Manage your account settings</p>
            </div>

            {/* Profile Info Card */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-violet-400" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Email
                            </label>
                            <Input
                                type="email"
                                value={profile?.email || ''}
                                disabled
                                className="bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Name
                            </label>
                            <Input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Your name"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isUpdatingProfile || editName === profile?.name}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="h-5 w-5 text-amber-400" />
                        Change Password
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className="bg-white/5 border-white/10 text-white pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="bg-white/5 border-white/10 text-white pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Min 8 karakter, huruf besar, huruf kecil, dan angka</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="bg-white/5 border-white/10 text-white pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            <Lock className="mr-2 h-4 w-4" />
                            {isChangingPassword ? 'Changing...' : 'Change Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-rose-500/20 bg-rose-500/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-lg text-rose-400">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                    <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="outline"
                        className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                    </Button>
                </CardContent>
            </Card>

            {/* Delete Account Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4">
                        <h3 className="text-xl font-bold text-rose-400">Delete Account</h3>
                        <p className="text-gray-400 text-sm">
                            Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data including transactions and categories will be lost.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Enter your password to confirm
                            </label>
                            <Input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Your password"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    setDeletePassword("")
                                }}
                                variant="outline"
                                className="border-gray-600 text-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || !deletePassword}
                                className="bg-rose-600 hover:bg-rose-700 text-white"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
