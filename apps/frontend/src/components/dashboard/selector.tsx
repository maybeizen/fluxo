'use client'

import React from 'react'

export type TabView = 'services' | 'invoices' | 'news'

interface TabSelectorProps {
    activeTab: TabView
    onTabChange: (tab: TabView) => void
    unreadNewsCount?: number
}

export default function TabSelector({
    activeTab,
    onTabChange,
    unreadNewsCount = 0,
}: TabSelectorProps) {
    return (
        <div className="mb-6 flex gap-2 border-b border-zinc-800">
            <button
                onClick={() => onTabChange('services')}
                className={`relative cursor-pointer px-4 py-2.5 text-sm font-medium transition-all ${activeTab === 'services' ? 'text-primary-400' : 'text-zinc-400 hover:text-zinc-300'} `}
            >
                <i className="fas fa-objects-column mr-2"></i>
                Services
                {activeTab === 'services' && (
                    <span className="bg-primary-400 absolute right-0 bottom-0 left-0 h-0.5"></span>
                )}
            </button>
            <button
                onClick={() => onTabChange('invoices')}
                className={`relative cursor-pointer px-4 py-2.5 text-sm font-medium transition-all ${activeTab === 'invoices' ? 'text-primary-400' : 'text-zinc-400 hover:text-zinc-300'} `}
            >
                <i className="fas fa-file-invoice-dollar mr-2"></i>
                Invoices
                {activeTab === 'invoices' && (
                    <span className="bg-primary-400 absolute right-0 bottom-0 left-0 h-0.5"></span>
                )}
            </button>
            <button
                onClick={() => onTabChange('news')}
                className={`relative cursor-pointer px-4 py-2.5 text-sm font-medium transition-all ${activeTab === 'news' ? 'text-primary-400' : 'text-zinc-400 hover:text-zinc-300'} `}
            >
                <i className="fas fa-newspaper mr-2"></i>
                News from Fluxo
                {unreadNewsCount > 0 && (
                    <span className="bg-primary-400 ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white">
                        {unreadNewsCount}
                    </span>
                )}
                {activeTab === 'news' && (
                    <span className="bg-primary-400 absolute right-0 bottom-0 left-0 h-0.5"></span>
                )}
            </button>
        </div>
    )
}
