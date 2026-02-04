'use client'

import React, { useEffect, useState } from 'react'
import {
    fetchPterodactylSettings,
    updatePterodactylSettings,
    testPterodactylCredentials,
    refreshPterodactylData,
} from '@/lib/admin/pterodactyl'
import { PterodactylSettings } from '@fluxo/types'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'
import OverviewTab from '@/components/admin/pterodactyl/overview-tab'
import ActionsTab from '@/components/admin/pterodactyl/actions-tab'
import SettingsTab from '@/components/admin/pterodactyl/settings-tab'
import NodesTab from '@/components/admin/pterodactyl/nodes-tab'
import UsersTab from '@/components/admin/pterodactyl/users-tab'
import ServersTab from '@/components/admin/pterodactyl/servers-tab'
import Button from '@/components/ui/button'

type TabType =
    | 'overview'
    | 'actions'
    | 'nodes'
    | 'users'
    | 'servers'
    | 'settings'

export default function AdminPterodactylPage() {
    const notifications = useNotifications()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [settings, setSettings] = useState<PterodactylSettings | null>(null)

    const [formData, setFormData] = useState({
        baseUrl: '',
        apiKey: '',
    })

    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true)
            const data = await fetchPterodactylSettings()
            if (data) {
                setSettings(data)
                setFormData({
                    baseUrl: data.baseUrl || '',
                    apiKey: '',
                })
            }
            setIsLoading(false)
        }
        loadSettings()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        const updates: Partial<PterodactylSettings> = {}
        if (formData.baseUrl !== settings?.baseUrl) {
            updates.baseUrl = formData.baseUrl || undefined
        }
        if (formData.apiKey) {
            updates.apiKey = formData.apiKey
        }

        const result = await updatePterodactylSettings(updates)

        if (result.success) {
            notifications.success('Pterodactyl settings updated successfully')
            if (result.settings) {
                setSettings(result.settings)
                setFormData((prev) => ({ ...prev, apiKey: '' }))
            }
        } else {
            notifications.error(
                result.message || 'Failed to update Pterodactyl settings'
            )
        }

        setIsSaving(false)
    }

    const handleTestCredentials = async () => {
        setIsTesting(true)

        const result = await testPterodactylCredentials()

        if (result.success) {
            notifications.success(
                result.message || 'Pterodactyl API credentials are valid'
            )
        } else {
            notifications.error(
                result.message || 'Failed to test Pterodactyl credentials'
            )
        }

        setIsTesting(false)
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)

        const result = await refreshPterodactylData()

        if (result.success) {
            notifications.success('Pterodactyl data refreshed successfully')
            setRefreshKey((prev) => prev + 1)
        } else {
            notifications.error(
                result.message || 'Failed to refresh Pterodactyl data'
            )
        }

        setIsRefreshing(false)
    }

    const updateFormData = (updates: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...updates }))
    }

    const tabs = [
        {
            id: 'overview' as TabType,
            label: 'Overview',
            icon: 'fas fa-chart-line',
        },
        { id: 'actions' as TabType, label: 'Actions', icon: 'fas fa-bolt' },
        { id: 'nodes' as TabType, label: 'Nodes', icon: 'fas fa-server' },
        { id: 'users' as TabType, label: 'Users', icon: 'fas fa-users' },
        { id: 'servers' as TabType, label: 'Servers', icon: 'fas fa-server' },
        { id: 'settings' as TabType, label: 'Settings', icon: 'fas fa-cog' },
    ]

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Pterodactyl
                        </h1>
                        <p className="text-zinc-400">
                            Manage Pterodactyl integration and server operations
                        </p>
                    </div>
                    {(activeTab === 'nodes' ||
                        activeTab === 'users' ||
                        activeTab === 'servers') && (
                        <Button
                            type="button"
                            variant="custom"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleRefresh}
                            loading={isRefreshing}
                            disabled={
                                isRefreshing ||
                                !settings?.baseUrl ||
                                !settings?.apiKey
                            }
                            icon="fas fa-sync-alt"
                        >
                            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                        </Button>
                    )}
                </div>

                <div className="mb-6 rounded-lg border border-zinc-900 bg-zinc-950">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-primary-400 text-primary-400'
                                        : 'border-transparent text-zinc-400 hover:text-white'
                                } `}
                            >
                                <i className={tab.icon}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-8">
                        <div className="flex items-center justify-center py-12">
                            <Spinner />
                        </div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <OverviewTab
                                settings={settings}
                                isTesting={isTesting}
                                onTestCredentials={handleTestCredentials}
                                onNavigateToSettings={() =>
                                    setActiveTab('settings')
                                }
                            />
                        )}

                        {activeTab === 'actions' && (
                            <ActionsTab settings={settings} />
                        )}

                        {activeTab === 'nodes' && (
                            <NodesTab refreshKey={refreshKey} />
                        )}

                        {activeTab === 'users' && (
                            <UsersTab refreshKey={refreshKey} />
                        )}

                        {activeTab === 'servers' && (
                            <ServersTab refreshKey={refreshKey} />
                        )}

                        {activeTab === 'settings' && (
                            <SettingsTab
                                formData={formData}
                                isSaving={isSaving}
                                isTesting={isTesting}
                                onFormDataChange={updateFormData}
                                onSubmit={handleSubmit}
                                onTestCredentials={handleTestCredentials}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
