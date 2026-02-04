'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
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
                    <div className="space-y-4">
                        {plugins.length === 0 ? (
                            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
                                No plugins found. Add plugins to{' '}
                                <code className="rounded bg-zinc-800 px-1 py-0.5">
                                    apps/api/plugins
                                </code>{' '}
                                and restart the API.
                            </div>
                        ) : (
                            plugins.map((plugin) => (
                                <PluginCard
                                    key={plugin.id}
                                    plugin={plugin}
                                    onConfigure={() =>
                                        handleConfigure(plugin.id)
                                    }
                                    onToggle={loadPlugins}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function PluginCard({
    plugin,
    onConfigure,
    onToggle,
}: {
    plugin: PluginListItem
    onConfigure: () => void
    onToggle: () => void
}) {
    const notifications = useNotifications()
    const [toggling, setToggling] = useState(false)

    const handleToggle = async () => {
        setToggling(true)
        try {
            const { enablePlugin, disablePlugin } =
                await import('@/lib/admin/plugins')
            const result = plugin.enabled
                ? await disablePlugin(plugin.id)
                : await enablePlugin(plugin.id)
            if (result.success) {
                notifications.success(
                    plugin.enabled ? 'Plugin disabled' : 'Plugin enabled'
                )
                onToggle()
            } else {
                notifications.error(result.message || 'Failed to update')
            }
        } catch {
            notifications.error('Failed to update plugin')
        } finally {
            setToggling(false)
        }
    }

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-zinc-700">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-white">
                            {plugin.name}
                        </h2>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                            v{plugin.version}
                        </span>
                        <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                                plugin.type === 'gateway'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-blue-500/20 text-blue-400'
                            }`}
                        >
                            {plugin.type === 'gateway' ? 'Gateway' : 'Service'}
                        </span>
                        <span
                            className={`rounded px-2 py-0.5 text-xs ${
                                plugin.shipped
                                    ? 'bg-zinc-700 text-zinc-300'
                                    : 'bg-amber-500/20 text-amber-400'
                            }`}
                        >
                            {plugin.shipped ? 'Shipped' : 'Installed'}
                        </span>
                    </div>
                    {plugin.description && (
                        <p className="mb-1 text-sm text-zinc-400">
                            {plugin.description}
                        </p>
                    )}
                    {plugin.author && (
                        <p className="text-xs text-zinc-500">
                            by {plugin.author}
                        </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1.5 text-sm ${
                                plugin.enabled
                                    ? 'text-green-500'
                                    : 'text-zinc-500'
                            }`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    plugin.enabled
                                        ? 'bg-green-500'
                                        : 'bg-zinc-600'
                                }`}
                            />
                            {plugin.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={toggling}
                        loading={toggling}
                        onClick={handleToggle}
                    >
                        {plugin.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onConfigure}
                        icon="fas fa-cog"
                    >
                        Configure
                    </Button>
                </div>
            </div>
        </div>
    )
}
