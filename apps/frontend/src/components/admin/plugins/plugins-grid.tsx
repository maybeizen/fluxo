'use client'

import React from 'react'
import PluginCard from '@/components/admin/plugins/plugin-card'
import type { PluginListItem } from '@/lib/plugins/types'

interface PluginsGridProps {
    plugins: PluginListItem[]
    onConfigure: (id: string) => void
    onToggle: () => void
}

export default function PluginsGrid({
    plugins,
    onConfigure,
    onToggle,
}: PluginsGridProps) {
    if (plugins.length === 0) {
        return (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
                No plugins found. Add plugins to{' '}
                <code className="rounded bg-zinc-800 px-1 py-0.5">
                    plugins/
                </code>{' '}
                and restart the API.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plugins.map((plugin) => (
                <PluginCard
                    key={plugin.id}
                    plugin={plugin}
                    onConfigure={() => onConfigure(plugin.id)}
                    onToggle={onToggle}
                />
            ))}
        </div>
    )
}
