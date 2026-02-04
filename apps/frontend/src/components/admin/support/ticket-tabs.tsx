'use client'

import React from 'react'

type TicketTabType = 'open' | 'closed'

interface TicketTabsProps {
    activeTab: TicketTabType
    onTabChange: (tab: TicketTabType) => void
    openCount: number
    closedCount: number
}

export default function TicketTabs({
    activeTab,
    onTabChange,
    openCount,
    closedCount,
}: TicketTabsProps) {
    return (
        <div className="mb-4 rounded-lg border border-zinc-900 bg-zinc-950">
            <div className="flex overflow-x-auto">
                <button
                    type="button"
                    onClick={() => onTabChange('open')}
                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                        activeTab === 'open'
                            ? 'border-primary-400 text-primary-400'
                            : 'border-transparent text-zinc-400 hover:text-white'
                    } `}
                >
                    <i className="fas fa-ticket-alt"></i>
                    Open Tickets
                    {openCount > 0 && (
                        <span className="ml-1 rounded bg-green-500/20 px-1.5 py-0.5 text-xs font-medium text-green-400">
                            {openCount}
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange('closed')}
                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                        activeTab === 'closed'
                            ? 'border-primary-400 text-primary-400'
                            : 'border-transparent text-zinc-400 hover:text-white'
                    } `}
                >
                    <i className="fas fa-check-circle"></i>
                    Closed Tickets
                    {closedCount > 0 && (
                        <span className="ml-1 rounded bg-zinc-500/20 px-1.5 py-0.5 text-xs font-medium text-zinc-400">
                            {closedCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    )
}

export type { TicketTabType }
