'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { fetchPluginIssues, reloadPlugin } from '@/lib/admin/plugins'
import type { PluginIssue } from '@/lib/admin/plugins'
import { useNotifications } from '@/context/notification-context'

function IssueCard({ issue }: { issue: PluginIssue }) {
    const severityStyles = {
        error: 'border-red-500/30 bg-red-500/10 text-red-400',
        warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    }
    const iconMap = {
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
    }
    const style = severityStyles[issue.severity]
    const icon = iconMap[issue.severity]

    return (
        <div className={`rounded-lg border p-4 ${style}`} role="alert">
            <div className="flex items-start gap-3">
                <i className={`${icon} mt-0.5 shrink-0`} />
                <div className="min-w-0 flex-1">
                    <p className="font-medium">{issue.message}</p>
                    {issue.details && (
                        <p className="mt-1 text-sm opacity-90">
                            {issue.details}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function PluginIssuesPage() {
    const params = useParams()
    const id = params.id as string
    const notifications = useNotifications()
    const [issues, setIssues] = useState<PluginIssue[]>([])
    const [loading, setLoading] = useState(true)
    const [reloading, setReloading] = useState(false)

    const loadIssues = () => {
        if (!id) return
        setLoading(true)
        fetchPluginIssues(id)
            .then(setIssues)
            .catch(() => setIssues([]))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadIssues()
    }, [id])

    const handleReload = async () => {
        setReloading(true)
        try {
            const result = await reloadPlugin(id)
            if (result.success) {
                notifications.success('Plugins reloaded')
                loadIssues()
            } else {
                notifications.error(result.message || 'Failed to reload')
            }
        } catch {
            notifications.error('Failed to reload plugins')
        } finally {
            setReloading(false)
        }
    }

    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-white">
                        Plugin issues
                    </h2>
                    <Button
                        variant="secondary"
                        size="sm"
                        loading={reloading}
                        disabled={reloading}
                        onClick={handleReload}
                        icon="fas fa-sync-alt"
                    >
                        Reload plugin
                    </Button>
                </div>
                <p className="mb-4 text-sm text-zinc-400">
                    Issues reported by this plugin (e.g. missing configuration,
                    API unreachable). Reload the plugin after changing options
                    to refresh its state.
                </p>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Spinner />
                    </div>
                ) : issues.length === 0 ? (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-8 text-center text-zinc-400">
                        <i className="fas fa-check-circle mb-2 text-2xl text-green-500/80" />
                        <p>No issues reported.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {issues.map((issue, i) => (
                            <li key={i}>
                                <IssueCard issue={issue} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}
