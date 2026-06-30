'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import Spinner from '@/components/ui/spinner'
import { fetchPluginById } from '@/lib/admin/plugins'
import type { PluginDetail } from '@/lib/admin/plugins'

const tabs = [
    { path: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
    { path: 'options', label: 'Options', icon: 'fas fa-cog' },
    { path: 'issues', label: 'Issues', icon: 'fas fa-exclamation-triangle' },
] as const

export default function PluginDetailLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const params = useParams()
    const pathname = usePathname()
    const id = params.id as string
    const [plugin, setPlugin] = useState<PluginDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        fetchPluginById(id)
            .then(setPlugin)
            .finally(() => setLoading(false))
    }, [id])

    if (!id) return null
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black px-4 pt-12 pb-12">
                <Spinner />
            </div>
        )
    }
    if (!plugin) {
        return (
            <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
                <div className="mx-auto max-w-7xl text-center">
                    <p className="mb-4 text-zinc-400">Plugin not found.</p>
                    <Link
                        href="/admin/plugins"
                        className="text-primary-400 hover:underline"
                    >
                        Back to Plugins
                    </Link>
                </div>
            </div>
        )
    }

    const base = `/admin/plugins/${id}`
    const currentTab =
        pathname?.replace(base, '').replace(/^\//, '') || 'overview'

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <Link
                    href="/admin/plugins"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white"
                >
                    <i className="fas fa-arrow-left" />
                    Back to Plugins
                </Link>

                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">
                        {plugin.name}
                    </h1>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-sm text-zinc-300">
                        v{plugin.version}
                    </span>
                    <span
                        className={`rounded px-2 py-0.5 text-sm font-medium ${
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

                <nav className="mb-8 border-b border-zinc-800">
                    <ul className="flex gap-1">
                        {tabs.map(({ path, label, icon }) => {
                            const href =
                                path === 'overview' ? base : `${base}/${path}`
                            const isActive = currentTab === path
                            return (
                                <li key={path}>
                                    <Link
                                        href={href}
                                        className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'border-primary-400 text-primary-400'
                                                : 'border-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                                        }`}
                                    >
                                        <i className={icon} />
                                        {label}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {children}
            </div>
        </div>
    )
}
