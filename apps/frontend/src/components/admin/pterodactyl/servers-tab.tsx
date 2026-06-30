'use client'

import React, { useEffect, useState } from 'react'
import { fetchPterodactylServers } from '@/lib/admin/pterodactyl'
import Spinner from '@/components/ui/spinner'

interface Server {
    id?: number
    uuid?: string
    identifier?: string
    name?: string
    description?: string
    status?: string
    suspended?: boolean
    user?: number
    node?: number
    allocation?: number
    nest?: number
    egg?: number
    pack?: number | null
    limits?: {
        memory?: number
        swap?: number
        disk?: number
        io?: number
        cpu?: number
    }
    feature_limits?: {
        databases?: number
        allocations?: number
        backups?: number
    }
    created_at?: string
    updated_at?: string
}

interface ServersTabProps {
    refreshKey: number
}

export default function ServersTab({ refreshKey }: ServersTabProps) {
    const [servers, setServers] = useState<Server[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadServers = async () => {
            setIsLoading(true)
            const data = await fetchPterodactylServers()
            setServers(data as Server[])
            setIsLoading(false)
        }
        loadServers()
    }, [refreshKey])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                    Servers
                </h2>
                {servers.length === 0 ? (
                    <p className="text-zinc-400">No servers found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Identifier
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Memory
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Disk
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Suspended
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {servers.map((server, index) => (
                                    <tr
                                        key={server.id || server.uuid || index}
                                        className="border-b border-zinc-900 hover:bg-zinc-900/50"
                                    >
                                        <td className="px-4 py-3 text-white">
                                            {server.name || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-zinc-400">
                                            {server.identifier || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${
                                                    server.status === 'running'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : server.status ===
                                                            'offline'
                                                          ? 'bg-primary-400/20 text-primary-300'
                                                          : 'bg-yellow-500/20 text-yellow-400'
                                                }`}
                                            >
                                                {server.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">
                                            {server.limits?.memory
                                                ? `${(server.limits.memory / 1024).toFixed(0)} MB`
                                                : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">
                                            {server.limits?.disk
                                                ? `${(server.limits.disk / 1024).toFixed(0)} MB`
                                                : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${
                                                    server.suspended
                                                        ? 'bg-primary-400/20 text-primary-300'
                                                        : 'bg-green-500/20 text-green-400'
                                                }`}
                                            >
                                                {server.suspended
                                                    ? 'Yes'
                                                    : 'No'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
