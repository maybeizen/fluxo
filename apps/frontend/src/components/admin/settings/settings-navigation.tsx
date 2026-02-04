'use client'

import React from 'react'

type TabType =
    | 'app'
    | 'theme'
    | 'auth'
    | 'integrations'
    | 'email'
    | 'gateways'
    | 'security'

interface SettingsNavigationProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
}

const tabs = [
    { id: 'app' as TabType, label: 'Application', icon: 'fas fa-cog' },
    {
        id: 'theme' as TabType,
        label: 'Theme',
        icon: 'fas fa-palette',
    },
    {
        id: 'auth' as TabType,
        label: 'Authentication',
        icon: 'fas fa-shield-halved',
    },
    {
        id: 'integrations' as TabType,
        label: 'Integrations',
        icon: 'fas fa-plug',
    },
    { id: 'email' as TabType, label: 'SMTP', icon: 'fas fa-envelope' },
    {
        id: 'gateways' as TabType,
        label: 'Gateways',
        icon: 'fas fa-credit-card',
    },
    { id: 'security' as TabType, label: 'Security', icon: 'fas fa-lock' },
]

export default function SettingsNavigation({
    activeTab,
    onTabChange,
}: SettingsNavigationProps) {
    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950">
            <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 md:px-6 ${
                            activeTab === tab.id
                                ? 'border-primary-400 text-primary-400'
                                : 'border-transparent text-zinc-400 hover:text-white'
                        }`}
                    >
                        <i className={tab.icon}></i>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
