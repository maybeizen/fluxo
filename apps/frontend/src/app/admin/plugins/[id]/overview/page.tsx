'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import {
    fetchPluginById,
    enablePlugin,
    disablePlugin,
} from '@/lib/admin/plugins'
import type { PluginDetail } from '@/lib/admin/plugins'
import { useNotifications } from '@/context/notification-context'

export default function PluginOverviewPage() {
    const params = useParams()
    const id = params.id as string
    const notifications = useNotifications()
    const [plugin, setPlugin] = useState<PluginDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)

    useEffect(() => {
        if (!id) return
        fetchPluginById(id)
            .then(setPlugin)
            .finally(() => setLoading(false))
    }, [id])

    const handleToggle = async () => {
        if (!plugin) return
        setToggling(true)
        try {
            const result = plugin.enabled
                ? await disablePlugin(id)
                : await enablePlugin(id)
            if (result.success) {
                notifications.success(
                    plugin.enabled ? 'Plugin disabled' : 'Plugin enabled'
                )
                setPlugin((p) => (p ? { ...p, enabled: !p.enabled } : null))
            } else {
                notifications.error(result.message || 'Failed to update')
            }
        } catch {
            notifications.error('Failed to update plugin')
        } finally {
            setToggling(false)
        }
    }

    if (loading || !plugin) {
        return (
            <div className="flex justify-center py-12">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">
                    Status
                </h2>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <span
                        className={`inline-flex items-center gap-2 text-sm ${
                            plugin.enabled ? 'text-green-500' : 'text-zinc-500'
                        }`}
                    >
                        <span
                            className={`h-3 w-3 rounded-full ${
                                plugin.enabled ? 'bg-green-500' : 'bg-zinc-600'
                            }`}
                        />
                        {plugin.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Button
                        variant={plugin.enabled ? 'fail' : 'success'}
                        size="sm"
                        disabled={toggling}
                        loading={toggling}
                        onClick={handleToggle}
                    >
                        {plugin.enabled ? 'Disable plugin' : 'Enable plugin'}
                    </Button>
                </div>
            </section>

            {plugin.description && (
                <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">
                        Description
                    </h2>
                    <p className="text-zinc-400">{plugin.description}</p>
                    {plugin.author && (
                        <p className="mt-2 text-sm text-zinc-500">
                            by {plugin.author}
                        </p>
                    )}
                </section>
            )}
        </div>
    )
}
