import React from 'react'

interface StatCardProps {
    icon: string
    iconColor: string
    iconBg: string
    label: string
    value: string | number
    className?: string
}

export default function StatCard({
    icon,
    iconColor,
    iconBg,
    label,
    value,
    className = '',
}: StatCardProps) {
    return (
        <div
            className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 ${className}`}
        >
            <div className="mb-3 flex items-center gap-3">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
                >
                    <i className={`${icon} text-lg ${iconColor}`}></i>
                </div>
                <span className="text-sm font-medium text-zinc-400">
                    {label}
                </span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    )
}
