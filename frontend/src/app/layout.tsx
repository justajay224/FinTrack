import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthGuard } from "@/components/auth/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FinTrack - Smart Financial Tracking",
    description: "Track your income and expenses with ease",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>
                <AuthGuard>
                    {children}
                </AuthGuard>
                <Toaster position="top-right" toastOptions={{
                    style: {
                        background: '#333',
                        color: '#fff',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                }} />
            </body>
        </html>
    );
}
