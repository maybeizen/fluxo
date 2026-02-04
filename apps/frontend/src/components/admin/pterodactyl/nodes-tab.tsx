'use client'

import React, { useEffect, useState } from 'react'
import { fetchPterodactylNodes } from '@/lib/admin/pterodactyl'
import Spinner from '@/components/ui/spinner'

interface Node {
    id?: number
    uuid?: string
    name?: string
    description?: string
    location_id?: number
    fqdn?: string
    scheme?: string
    behind_proxy?: boolean
    maintenance_mode?: boolean
    memory?: number
    memory_overallocate?: number
    disk?: number
    disk_overallocate?: number
    upload_size?: number
    daemon_listen?: number
    daemon_sftp?: number
    daemon_base?: string
    created_at?: string
    updated_at?: string
}

interface NodesTabProps {
    refreshKey: number
}

export default function NodesTab({ refreshKey }: NodesTabProps) {
    const [nodes, setNodes] = useState<Node[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadNodes = async () => {
            setIsLoading(true)
            const data = await fetchPterodactylNodes()
            setNodes(data as Node[])
            setIsLoading(false)
        }
        loadNodes()
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
                <h2 className="mb-4 text-xl font-semibold text-white">Nodes</h2>
                {nodes.length === 0 ? (
                    <p className="text-zinc-400">No nodes found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        FQDN
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Memory
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Disk
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {nodes.map((node, index) => (
                                    <tr
                                        key={node.id || node.uuid || index}
                                        className="border-b border-zinc-900 hover:bg-zinc-900/50"
                                    >
                                        <td className="px-4 py-3 text-white">
                                            {node.name || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-zinc-400">
                                            {node.fqdn || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">
                                            {node.memory
                                                ? `${(node.memory / 1024).toFixed(0)} GB`
                                                : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">
                                            {node.disk
                                                ? `${(node.disk / 1024).toFixed(0)} GB`
                                                : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${
                                                    node.maintenance_mode
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-green-500/20 text-green-400'
                                                }`}
                                            >
                                                {node.maintenance_mode
                                                    ? 'Maintenance'
                                                    : 'Active'}
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
