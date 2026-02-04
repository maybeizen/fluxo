'use client'

import React, { useEffect, useState } from 'react'
import { fetchGatewayPlugins } from '@/lib/plugins/loader'
import type { GatewayPluginListItem } from '@/lib/plugins/loader'

export interface GatewayPluginSelectorProps {
    value: string
    onChange: (gatewayPluginId: string) => void
    /** Include built-in option e.g. "stripe" so value can be empty for default */
    includeDefault?: boolean
    defaultLabel?: string
}

/**
 * Renders a list of enabled gateway plugins (and optional default) for checkout.
 */
export default function GatewayPluginSelector({
    value,
    onChange,
    includeDefault = true,
    defaultLabel = 'Stripe',
}: GatewayPluginSelectorProps) {
    const [gateways, setGateways] = useState<GatewayPluginListItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchGatewayPlugins()
            .then(setGateways)
            .catch(() => setGateways([]))
            .finally(() => setLoading(false))
    }, [])

    if (loading)
        return <div className="text-zinc-400">Loading payment methods...</div>

    const options = [
        ...(includeDefault
            ? [{ id: '', name: defaultLabel, paymentProviderKey: 'stripe' }]
            : []),
        ...gateways,
    ]

    if (options.length <= 1) return null

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
                Payment method
            </label>
            <div className="flex flex-wrap gap-3">
                {options.map((g) => (
                    <label
                        key={g.id || 'default'}
                        className="flex cursor-pointer items-center gap-2"
                    >
                        <input
                            type="radio"
                            name="gateway"
                            value={g.id || ''}
                            checked={value === (g.id || '')}
                            onChange={() => onChange(g.id || '')}
                            className="text-primary rounded border-gray-600 bg-gray-800"
                        />
                        <span className="text-white">{g.name}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}
