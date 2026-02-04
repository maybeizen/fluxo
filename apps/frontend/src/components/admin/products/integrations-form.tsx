'use client'

import React, { useEffect, useState } from 'react'
import { PterodactylIntegration } from '@fluxo/types'
import {
    fetchPterodactylSettings,
    fetchPterodactylLocations,
    fetchPterodactylNests,
    fetchPterodactylEggs,
    fetchPterodactylNodes,
} from '@/lib/admin/pterodactyl'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Checkbox from '@/components/ui/input/checkbox'

interface PterodactylLocation {
    id: number
    short: string
}
interface PterodactylNode {
    id: number
    name: string
}
interface PterodactylNest {
    id: number
    name: string
}
interface PterodactylEgg {
    id: number
    name: string
}

interface IntegrationsFormProps {
    pterodactyl: PterodactylIntegration | undefined
    setPterodactyl: (value: PterodactylIntegration | undefined) => void
    errors: Record<string, string>
}

export default function IntegrationsForm({
    pterodactyl,
    setPterodactyl,
}: IntegrationsFormProps) {
    const [pterodactylConfigured, setPterodactylConfigured] = useState(false)
    const [locations, setLocations] = useState<PterodactylLocation[]>([])
    const [nodes, setNodes] = useState<PterodactylNode[]>([])
    const [nests, setNests] = useState<PterodactylNest[]>([])
    const [eggs, setEggs] = useState<PterodactylEgg[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkPterodactyl = async () => {
            try {
                const settings = await fetchPterodactylSettings()
                if (settings?.baseUrl && settings?.apiKey) {
                    setPterodactylConfigured(true)
                    await loadPterodactylData()
                }
            } catch (error) {
                console.error(
                    'Failed to check Pterodactyl configuration:',
                    error
                )
            } finally {
                setIsLoading(false)
            }
        }

        checkPterodactyl()
    }, [])

    const loadPterodactylData = async () => {
        try {
            const [locationsData, nodesData, nestsData] = await Promise.all([
                fetchPterodactylLocations(),
                fetchPterodactylNodes(),
                fetchPterodactylNests(),
            ])

            setLocations(locationsData as PterodactylLocation[])
            setNodes(nodesData as PterodactylNode[])
            setNests(nestsData as PterodactylNest[])
        } catch (error) {
            console.error('Failed to load Pterodactyl data:', error)
        }
    }

    useEffect(() => {
        const loadEggs = async () => {
            if (pterodactyl?.nestId) {
                try {
                    const eggsData = await fetchPterodactylEggs(
                        pterodactyl.nestId
                    )
                    setEggs(eggsData as PterodactylEgg[])
                } catch (error) {
                    console.error('Failed to load eggs:', error)
                }
            } else {
                setEggs([])
            }
        }

        loadEggs()
    }, [pterodactyl?.nestId])

    const updatePterodactyl = (updates: Partial<PterodactylIntegration>) => {
        setPterodactyl({
            enabled: false,
            ...pterodactyl,
            ...updates,
        })
    }

    if (isLoading) {
        return (
            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                <div className="flex items-center justify-center py-8">
                    <i className="fas fa-spinner-third fa-spin text-2xl text-zinc-400"></i>
                </div>
            </div>
        )
    }

    if (!pterodactylConfigured) {
        return (
            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                    Integrations
                </h2>
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                    <p className="text-yellow-400">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Pterodactyl is not configured. Please configure it in
                        Settings → Integrations → Pterodactyl to enable
                        integration options.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                Integrations
            </h2>

            <div className="space-y-6">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Pterodactyl
                            </h3>
                            <p className="text-sm text-zinc-400">
                                Configure Pterodactyl server creation settings
                            </p>
                        </div>
                        <Checkbox
                            checked={pterodactyl?.enabled || false}
                            onChange={(e) =>
                                updatePterodactyl({ enabled: e.target.checked })
                            }
                        />
                    </div>

                    {pterodactyl?.enabled && (
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="pterodactyl-location">
                                        Location
                                    </InputLabel>
                                    <select
                                        id="pterodactyl-location"
                                        value={pterodactyl.locationId || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                locationId: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="focus:border-primary-300 focus:ring-primary-300 w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-white focus:ring-2 focus:outline-none"
                                    >
                                        <option value="">
                                            Select Location
                                        </option>
                                        {locations.map((location) => (
                                            <option
                                                key={location.id}
                                                value={location.id}
                                            >
                                                {location.short}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-node">
                                        Node
                                    </InputLabel>
                                    <select
                                        id="pterodactyl-node"
                                        value={pterodactyl.nodeId || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                nodeId: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="focus:border-primary-300 focus:ring-primary-300 w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-white focus:ring-2 focus:outline-none"
                                    >
                                        <option value="">Select Node</option>
                                        {nodes.map((node) => (
                                            <option
                                                key={node.id}
                                                value={node.id}
                                            >
                                                {node.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-nest">
                                        Nest
                                    </InputLabel>
                                    <select
                                        id="pterodactyl-nest"
                                        value={pterodactyl.nestId || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                nestId: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                                eggId: undefined,
                                            })
                                        }
                                        className="focus:border-primary-300 focus:ring-primary-300 w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-white focus:ring-2 focus:outline-none"
                                    >
                                        <option value="">Select Nest</option>
                                        {nests.map((nest) => (
                                            <option
                                                key={nest.id}
                                                value={nest.id}
                                            >
                                                {nest.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-egg">
                                        Egg
                                    </InputLabel>
                                    <select
                                        id="pterodactyl-egg"
                                        value={pterodactyl.eggId || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                eggId: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        disabled={!pterodactyl.nestId}
                                        className="focus:border-primary-300 focus:ring-primary-300 w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-white focus:ring-2 focus:outline-none disabled:opacity-50"
                                    >
                                        <option value="">Select Egg</option>
                                        {eggs.map((egg) => (
                                            <option key={egg.id} value={egg.id}>
                                                {egg.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="pterodactyl-memory">
                                        Memory (MB)
                                    </InputLabel>
                                    <Input
                                        id="pterodactyl-memory"
                                        type="number"
                                        value={pterodactyl.memory || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                memory: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        placeholder="1024"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-swap">
                                        Swap (MB)
                                    </InputLabel>
                                    <Input
                                        id="pterodactyl-swap"
                                        type="number"
                                        value={pterodactyl.swap || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                swap: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-disk">
                                        Disk Space (MB)
                                    </InputLabel>
                                    <Input
                                        id="pterodactyl-disk"
                                        type="number"
                                        value={pterodactyl.disk || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                disk: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        placeholder="5120"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-io">
                                        IO Weight
                                    </InputLabel>
                                    <Input
                                        id="pterodactyl-io"
                                        type="number"
                                        value={pterodactyl.io || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                io: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        placeholder="500"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-cpu">
                                        CPU (%)
                                    </InputLabel>
                                    <Input
                                        id="pterodactyl-cpu"
                                        type="number"
                                        value={pterodactyl.cpu || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                cpu: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        placeholder="100"
                                        min="0"
                                        max="100"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-cpu-pinning">
                                        CPU Pinning
                                    </InputLabel>
                                    <Input
                                        id="pterodactyl-cpu-pinning"
                                        type="text"
                                        value={pterodactyl.cpuPinning || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                cpuPinning:
                                                    e.target.value || undefined,
                                            })
                                        }
                                        placeholder="0,1"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-databases">
                                        Databases
                                    </InputLabel>
                                    <Input
                                        id="pterodactyl-databases"
                                        type="number"
                                        value={pterodactyl.databases || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                databases: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-backups">
                                        Backups
                                    </InputLabel>
                                    <Input
                                        id="pterodactyl-backups"
                                        type="number"
                                        value={pterodactyl.backups || ''}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                backups: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pterodactyl-allocations">
                                        Additional Allocations
                                    </InputLabel>
                                    <Input
                                        id="pterodactyl-allocations"
                                        type="number"
                                        value={
                                            pterodactyl.additionalAllocations ||
                                            ''
                                        }
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                additionalAllocations: e.target
                                                    .value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="pterodactyl-oom-killer"
                                        checked={pterodactyl.oomKiller || false}
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                oomKiller: e.target.checked,
                                            })
                                        }
                                    />
                                    <InputLabel
                                        htmlFor="pterodactyl-oom-killer"
                                        className="mb-0"
                                    >
                                        OOM Killer
                                    </InputLabel>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="pterodactyl-skip-install"
                                        checked={
                                            pterodactyl.skipEggInstallScript ||
                                            false
                                        }
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                skipEggInstallScript:
                                                    e.target.checked,
                                            })
                                        }
                                    />
                                    <InputLabel
                                        htmlFor="pterodactyl-skip-install"
                                        className="mb-0"
                                    >
                                        Skip Egg Install Script
                                    </InputLabel>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="pterodactyl-start-on-completion"
                                        checked={
                                            pterodactyl.startOnCompletion !==
                                            false
                                        }
                                        onChange={(e) =>
                                            updatePterodactyl({
                                                startOnCompletion:
                                                    e.target.checked,
                                            })
                                        }
                                    />
                                    <InputLabel
                                        htmlFor="pterodactyl-start-on-completion"
                                        className="mb-0"
                                    >
                                        Start on Completion
                                    </InputLabel>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
