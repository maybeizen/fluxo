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
        <div className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <PluginIcon
                id={plugin.id}
                name={plugin.name}
                iconUrl={plugin.iconUrl}
                size="md"
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h2 className="truncate font-medium text-white">
                            {plugin.name}
                        </h2>
                        <p className="text-xs text-zinc-500">
                            {plugin.type === 'gateway' ? 'Gateway' : 'Service'}{' '}
                            · v{plugin.version}
                        </p>
                    </div>
                    <span
                        className={`shrink-0 text-xs ${
                            plugin.enabled ? 'text-green-500' : 'text-zinc-500'
                        }`}
                    >
                        {plugin.enabled ? 'On' : 'Off'}
                    </span>
                </div>

                {plugin.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                        {plugin.description}
                    </p>
                )}

                <div className="mt-3 flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={toggling}
                        loading={toggling}
                        onClick={handleToggle}
                    >
                        {plugin.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={onConfigure}>
                        Configure
                    </Button>
                </div>
            </div>
        </div>
    )
}
