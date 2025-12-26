import { Sidebar } from "@/components/layout/Sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background relative selection:bg-violet-500/30">
            {/* Ambient background blob */}
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />

            <Sidebar />

            {/* Main content: pt-20 for mobile header, lg:pt-8 for desktop top padding, lg:ml-64 for desktop sidebar */}
            <main className="pt-20 lg:pt-8 lg:ml-64 p-4 lg:p-8 relative z-10 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}

