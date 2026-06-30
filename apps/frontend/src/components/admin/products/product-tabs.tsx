'use client'

import React, { useState } from 'react'

interface Tab {
    id: string
    label: string
    icon?: string
}

interface ProductTabsProps {
    tabs: Tab[]
    children: React.ReactNode
    defaultTab?: string
    enabledTabs?: string[]
}

export default function ProductTabs({
    tabs,
    children,
    defaultTab,
    enabledTabs,
}: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

    const visibleTabs = enabledTabs
        ? tabs.filter((tab) => enabledTabs.includes(tab.id))
        : tabs

    const validActiveTab = visibleTabs.find((tab) => tab.id === activeTab)
        ? activeTab
        : visibleTabs[0]?.id

    const activeTabIndex = tabs.findIndex((tab) => tab.id === validActiveTab)
    const activeContent = Array.isArray(children)
        ? children[activeTabIndex]
        : children

    return (
        <div className="space-y-6">
            {visibleTabs.length > 1 && (
                <div className="border-b border-zinc-900">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto">
                        {visibleTabs.map((tab) => {
                            const isEnabled =
                                !enabledTabs || enabledTabs.includes(tab.id)
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (isEnabled) {
                                            setActiveTab(tab.id)
                                        }
                                    }}
                                    disabled={!isEnabled}
                                    onMouseDown={(e) => {
                                        if (!isEnabled) {
                                            e.preventDefault()
                                        }
                                    }}
                                    className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                                        validActiveTab === tab.id
                                            ? 'border-primary-400 text-primary-400'
                                            : isEnabled
                                              ? 'border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                                              : 'cursor-not-allowed border-transparent text-zinc-600'
                                    }`}
                                >
                                    {tab.icon && (
                                        <i className={`${tab.icon} mr-2`}></i>
                                    )}
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>
            )}

            <div>{activeContent}</div>
        </div>
    )
}
