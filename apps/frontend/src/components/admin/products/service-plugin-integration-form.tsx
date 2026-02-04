'use client'

import React from 'react'
import InputLabel from '@/components/ui/input/input-label'
import ServicePluginConfigForm from '@/components/admin/products/service-plugin-config-form'
import type { PluginListItem } from '@/lib/plugins/types'

export interface ServicePluginIntegrationFormProps {
    /** List of plugins from API (admin/plugins) - filter to service + enabled in parent */
    servicePlugins: PluginListItem[]
    servicePluginId: string
    setServicePluginId: (id: string) => void
    servicePluginConfig: Record<string, unknown>
    setServicePluginConfig: (config: Record<string, unknown>) => void
    disabled?: boolean
}

/**
 * Integrations section: dropdown of installed service plugins + schema-driven config form.
 * The selected plugin's getConfigFields() schema is rendered as inputs; values are saved with the product.
 */
export default function ServicePluginIntegrationForm({
    servicePlugins,
    servicePluginId,
    setServicePluginId,
    servicePluginConfig,
    setServicePluginConfig,
    disabled = false,
}: ServicePluginIntegrationFormProps) {
    const selectedPlugin = servicePlugins.find((p) => p.id === servicePluginId)

    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                Integrations
            </h2>
            <p className="mb-4 text-sm text-zinc-400">
                Choose a service plugin to provision this product. The plugin
                defines the options (e.g. RAM, disk) that are saved with the
                product and used when a customer orders.
            </p>

            <div className="space-y-4">
                <div>
                    <InputLabel htmlFor="product-service-plugin">
                        Service plugin
                    </InputLabel>
                    <select
                        id="product-service-plugin"
                        value={servicePluginId}
                        onChange={(e) => {
                            setServicePluginId(e.target.value)
                            setServicePluginConfig({})
                        }}
                        disabled={disabled}
                        className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 block w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-white placeholder-zinc-400 focus:ring-2 focus:outline-none"
                    >
                        <option value="">None</option>
                        {servicePlugins.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedPlugin?.configFields &&
                    selectedPlugin.configFields.length > 0 && (
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                            <h3 className="mb-3 text-sm font-medium text-zinc-300">
                                {selectedPlugin.name} options
                            </h3>
                            <ServicePluginConfigForm
                                pluginId={servicePluginId}
                                configFields={selectedPlugin.configFields}
                                value={servicePluginConfig}
                                onChange={setServicePluginConfig}
                                disabled={disabled}
                            />
                        </div>
                    )}

                {selectedPlugin &&
                    (!selectedPlugin.configFields ||
                        selectedPlugin.configFields.length === 0) && (
                        <p className="text-sm text-zinc-500">
                            This plugin has no configurable options for this
                            product.
                        </p>
                    )}
            </div>
        </div>
    )
}
