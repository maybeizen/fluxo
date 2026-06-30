'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/button'
import PluginIcon from '@/components/admin/plugins/plugin-icon'
import type { PluginListItem } from '@/lib/plugins/types'
import { useNotifications } from '@/context/notification-context'

interface PluginCardProps {
    plugin: PluginListItem
    onConfigure: () => void
    onToggle: () => void
}

export default function PluginCard({
    plugin,
    onConfigure,
    onToggle,
}: PluginCardProps) {
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
        <div className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20">
            <div className="mb-4 flex justify-center">
                <PluginIcon
                    id={plugin.id}
                    name={plugin.name}
                    iconUrl={plugin.iconUrl}
                    size="lg"
                />
            </div>

            <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
                <h2 className="text-base font-semibold text-white">
                    {plugin.name}
                </h2>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                    v{plugin.version}
                </span>
            </div>

            <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
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
                <p className="mb-4 line-clamp-2 flex-1 text-center text-sm text-zinc-400">
                    {plugin.description}
                </p>
            )}

            <div className="mt-auto space-y-3 border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 text-sm ${
                            plugin.enabled ? 'text-green-500' : 'text-zinc-500'
                        }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${
                                plugin.enabled ? 'bg-green-500' : 'bg-zinc-600'
                            }`}
                        />
                        {plugin.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={toggling}
                        loading={toggling}
                        onClick={handleToggle}
                        className="flex-1 sm:flex-none"
                    >
                        {plugin.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onConfigure}
                        icon="fas fa-cog"
                        className="flex-1 sm:flex-none"
                    >
                        Configure
                    </Button>
                </div>
            </div>
        </div>
    )
}
