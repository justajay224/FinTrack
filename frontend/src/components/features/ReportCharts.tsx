"use client"

import { useEffect, useRef } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
)

export const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                color: 'white',
                font: {
                    family: 'Inter, sans-serif'
                }
            }
        },
        title: {
            display: false,
        },
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
            }
        },
        y: {
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
            }
        }
    }
}

export const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000,
        easing: 'easeOutQuart' as const
    },
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                color: 'white',
                font: {
                    family: 'Inter, sans-serif',
                    size: 12
                },
                boxWidth: 12,
                padding: 15,
                usePointStyle: true,
                pointStyle: 'rectRounded'
            }
        }
    }
}

interface ChartProps {
    data: any
}

export function DailyReportChart({ data }: ChartProps) {
    const chartRef = useRef<any>(null)

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
                chartRef.current.resize()
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="w-full" style={{ height: '300px' }}>
            <Line ref={chartRef} options={{ ...options, maintainAspectRatio: false }} data={data} />
        </div>
    )
}

export function MonthlyReportChart({ data }: ChartProps) {
    const chartRef = useRef<any>(null)

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
                chartRef.current.resize()
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="w-full" style={{ height: '300px' }}>
            <Bar ref={chartRef} options={{ ...options, maintainAspectRatio: false }} data={data} />
        </div>
    )
}

export function CategoryReportChart({ data }: ChartProps) {
    const chartRef = useRef<any>(null)

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
                chartRef.current.resize()
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="w-full flex items-center justify-center" style={{ height: '280px' }}>
            <Doughnut ref={chartRef} options={doughnutOptions} data={data} />
        </div>
    )
}
