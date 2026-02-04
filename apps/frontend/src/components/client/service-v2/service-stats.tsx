import React from 'react'

interface StatCardProps {
    icon: string
    label: string
    value: string
    iconColor: string
    iconBg: string
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    label,
    value,
    iconColor,
    iconBg,
}) => {
    return (
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700/50">
            <div className="flex items-center gap-4">
                <div
                    className={`h-14 w-14 rounded-xl ${iconBg} flex flex-shrink-0 items-center justify-center`}
                >
                    <i className={`${icon} ${iconColor} text-2xl`}></i>
                </div>
                <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs tracking-wider text-zinc-500 uppercase">
                        {label}
                    </p>
                    <p className="truncate text-xl font-bold text-white">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    )
}

interface ServiceStatsProps {
    price: string
    location: string
    dueDate: string
}

export const ServiceStats: React.FC<ServiceStatsProps> = ({
    price,
    location,
    dueDate,
}) => {
    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
                icon="fas fa-credit-card"
                label="Monthly Price"
                value={price}
                iconColor="text-green-400"
                iconBg="bg-green-500/10"
            />
            <StatCard
                icon="fas fa-location-dot"
                label="Location"
                value={location}
                iconColor="text-blue-400"
                iconBg="bg-blue-500/10"
            />
            <StatCard
                icon="fas fa-calendar-days"
                label="Due Date"
                value={dueDate}
                iconColor="text-purple-400"
                iconBg="bg-purple-500/10"
            />
        </div>
    )
}
