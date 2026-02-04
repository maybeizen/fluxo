'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { InputLabel } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/input'

const MINECRAFT_VERSIONS = [
    { value: 'latest', label: 'Latest' },
    { value: '1.21.1', label: '1.21.1' },
    { value: '1.21', label: '1.21' },
    { value: '1.20.6', label: '1.20.6' },
    { value: '1.20.5', label: '1.20.5' },
    { value: '1.20.4', label: '1.20.4' },
    { value: '1.20.1', label: '1.20.1' },
    { value: '1.20', label: '1.20' },
    { value: '1.19.4', label: '1.19.4' },
    { value: '1.19.2', label: '1.19.2' },
    { value: '1.19', label: '1.19' },
    { value: '1.18.2', label: '1.18.2' },
]

interface ServiceConfigProps {
    serviceName: string
    version: string
    dedicatedIP: boolean
    proxySetup: boolean
    onServiceNameChange: (value: string) => void
    onVersionChange: (value: string) => void
    onDedicatedIPChange: (value: boolean) => void
    onProxySetupChange: (value: boolean) => void
}

export default function ServiceConfig({
    serviceName,
    version,
    dedicatedIP,
    proxySetup,
    onServiceNameChange,
    onVersionChange,
    onDedicatedIPChange,
    onProxySetupChange,
}: ServiceConfigProps) {
    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 lg:p-8">
            <h2 className="mb-2 text-xl font-semibold text-white">
                Step 4: Service Configuration
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
                Configure your server name, version, and optional addons.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <InputLabel htmlFor="serviceName">Service Name</InputLabel>
                    <Input
                        id="serviceName"
                        value={serviceName}
                        onChange={(e) => onServiceNameChange(e.target.value)}
                        placeholder="My Awesome Server"
                        className="mt-2"
                        required
                    />
                </div>

                <div>
                    <InputLabel htmlFor="version">Minecraft Version</InputLabel>
                    <Input
                        id="version"
                        value={version}
                        onChange={(e) => onVersionChange(e.target.value)}
                        placeholder="e.g. 1.21.1 or 'latest'"
                        className="mt-2"
                        required
                        autoComplete="off"
                        list="minecraft-versions"
                    />
                    <datalist id="minecraft-versions">
                        {MINECRAFT_VERSIONS.map((v) => (
                            <option key={v.value} value={v.value}>
                                {v.label}
                            </option>
                        ))}
                    </datalist>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                <Checkbox
                    id="dedicatedIP"
                    checked={dedicatedIP}
                    onChange={(e) => onDedicatedIPChange(e.target.checked)}
                    label={
                        <span>
                            Dedicated IP Address{' '}
                            <span className="text-primary-400">
                                (+$2.99/month)
                            </span>
                        </span>
                    }
                />

                <Checkbox
                    id="proxySetup"
                    checked={proxySetup}
                    onChange={(e) => onProxySetupChange(e.target.checked)}
                    label={
                        <span>
                            Proxy Setup{' '}
                            <span className="text-primary-400">
                                ($10 one-time)
                            </span>
                        </span>
                    }
                />
            </div>
        </div>
    )
}
