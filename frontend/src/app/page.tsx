"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, TrendingUp, PieChart, Shield, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#020817] text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                        FinTrack
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-gray-300 hover:text-white">
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                        Kelola Keuanganmu
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
                            Lebih Cerdas
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        Catat pemasukan dan pengeluaran dengan mudah. Dapatkan laporan keuangan yang jelas dan terstruktur.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 h-12 px-8 text-base">
                                Mulai
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 h-12 px-8 text-base">
                                Sudah Punya Akun
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="grid md:grid-cols-3 gap-6 mt-24"
                >
                    <FeatureCard
                        icon={<TrendingUp className="h-8 w-8 text-emerald-400" />}
                        title="Lacak Transaksi"
                        description="Catat pemasukan dan pengeluaran dengan kategori yang terorganisir."
                    />
                    <FeatureCard
                        icon={<PieChart className="h-8 w-8 text-violet-400" />}
                        title="Laporan Visual"
                        description="Lihat ringkasan keuangan dalam bentuk grafik yang mudah dipahami."
                    />
                    <FeatureCard
                        icon={<Shield className="h-8 w-8 text-blue-400" />}
                        title="Aman & Privat"
                        description="Data keuanganmu terenkripsi dan hanya bisa diakses olehmu."
                    />
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 py-8 text-center text-gray-500 text-sm">
                © 2025 FinTrack. All rights reserved.
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] transition-all">
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    )
}
