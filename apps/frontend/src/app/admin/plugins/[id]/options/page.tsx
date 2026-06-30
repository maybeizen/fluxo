'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import InputLabel from '@/components/ui/input/input-label'
import PluginSettingsForm from '@/components/admin/plugins/plugin-settings-form'
import {
    fetchPluginById,
    fetchPluginConfig,
    updatePluginConfig,
} from '@/lib/admin/plugins'
import type { PluginDetail } from '@/lib/admin/plugins'
import { useNotifications } from '@/context/notification-context'

export default function PluginOptionsPage() {
    const params = useParams()
    const id = params.id as string
    const notifications = useNotifications()
    const [plugin, setPlugin] = useState<PluginDetail | null>(null)
    const [config, setConfig] = useState<Record<string, unknown>>({})
    const [configJson, setConfigJson] = useState('{}')
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        Promise.all([fetchPluginById(id), fetchPluginConfig(id)])
            .then(([pluginData, configData]) => {
                setPlugin(pluginData ?? null)
                const cfg = configData ?? {}
                setConfig(cfg)
                setConfigJson(JSON.stringify(cfg, null, 2))
            })
            .catch(() => notifications.error('Failed to load plugin'))
            .finally(() => setLoading(false))
    }, [id])

    const handleSaveConfigFromForm = async (
        configToSave: Record<string, unknown>
    ) => {
        setIsSaving(true)
        try {
            const result = await updatePluginConfig(id, configToSave)
            if (result.success) {
                notifications.success('Configuration saved')
                setConfig(configToSave)
            } else {
                notifications.error(result.message || 'Failed to save')
            }
        } catch {
            notifications.error('Failed to save configuration')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveConfigFromJson = async () => {
        let parsed: Record<string, unknown>
        try {
            parsed = JSON.parse(configJson) as Record<string, unknown>
        } catch {
            notifications.error('Invalid JSON')
            return
        }
        await handleSaveConfigFromForm(parsed)
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
                    Configuration
                </h2>
                {plugin.settingsSchema && plugin.settingsSchema.length > 0 ? (
                    <>
                        <p className="mb-4 text-sm text-zinc-400">
                            Plugin-specific settings. Values are stored in the
                            database and used by the plugin when it runs.
                        </p>
                        <PluginSettingsForm
                            settingsSchema={plugin.settingsSchema}
                            value={config}
                            onChange={setConfig}
                            disabled={isSaving}
                        />
                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="primary"
                                size="md"
                                loading={isSaving}
                                disabled={isSaving}
                                onClick={() => handleSaveConfigFromForm(config)}
                                icon="fas fa-save"
                            >
                                Save configuration
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-zinc-400">
                            This plugin does not define a settings schema. Edit
                            config as JSON.
                        </p>
                        <div>
                            <InputLabel htmlFor="config-json">
                                Config (JSON)
                            </InputLabel>
                            <textarea
                                id="config-json"
                                value={configJson}
                                onChange={(e) => setConfigJson(e.target.value)}
                                rows={12}
                                className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 font-mono text-sm text-white placeholder-zinc-400 focus:ring-2 focus:outline-none"
                                spellCheck={false}
                            />
                            <div className="mt-3 flex justify-end">
                                <Button
                                    variant="primary"
                                    size="md"
                                    loading={isSaving}
                                    disabled={isSaving}
                                    onClick={handleSaveConfigFromJson}
                                    icon="fas fa-save"
                                >
                                    Save configuration
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </div>
    )
}
