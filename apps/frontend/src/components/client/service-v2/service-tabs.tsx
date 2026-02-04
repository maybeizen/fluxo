'use client'

import React from 'react'

interface Tab {
    id: string
    label: string
    icon: string
}

interface ServiceTabsProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
}

export const ServiceTabs: React.FC<ServiceTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
}) => {
    return (
        <div className="mb-6 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-1 backdrop-blur-sm">
            <div className="flex gap-1">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
                                isActive
                                    ? 'bg-primary-400/10 text-primary-400'
                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                            } `}
                        >
                            <i className={`${tab.icon} text-sm`}></i>
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
