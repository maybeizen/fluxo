'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/spinner'
import PluginsGrid from '@/components/admin/plugins/plugins-grid'
import { fetchAdminPlugins } from '@/lib/admin/plugins'
import type { PluginListItem } from '@/lib/plugins/types'
import { useNotifications } from '@/context/notification-context'

export default function AdminPluginsPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const [plugins, setPlugins] = useState<PluginListItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const loadPlugins = async () => {
        setIsLoading(true)
        try {
            const list = await fetchAdminPlugins()
            setPlugins(list)
        } catch {
            notifications.error('Failed to load plugins')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadPlugins()
    }, [])

    const handleConfigure = (id: string) => {
        router.push(`/admin/plugins/${id}/overview`)
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-white">
                        Plugins
                    </h1>
                    <p className="text-zinc-400">
                        Manage gateway and service plugins. Enable or disable
                        plugins and configure their settings.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Spinner />
                    </div>
                ) : (
                    <PluginsGrid
                        plugins={plugins}
                        onConfigure={handleConfigure}
                        onToggle={loadPlugins}
                    />
                )}
            </div>
        </div>
    )
}
