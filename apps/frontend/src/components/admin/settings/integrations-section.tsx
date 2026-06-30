'use client'

import React from 'react'
import DiscordSettings from './discord-settings'
import Button from '@/components/ui/button'

interface IntegrationsSectionProps {
    formData: {
        discordClientId: string
        discordClientSecret: string
        discordRedirectUri: string
    }
    onFormDataChange: (
        updates: Partial<IntegrationsSectionProps['formData']>
    ) => void
    onSubmit: (e: React.FormEvent) => void
    isSaving: boolean
}

export default function IntegrationsSection({
    formData,
    onFormDataChange,
    onSubmit,
    isSaving,
}: IntegrationsSectionProps) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="mb-6 text-xl font-semibold text-white">
                    Integrations
                </h2>
                <p className="mb-6 text-sm text-zinc-400">
                    Service plugins such as Pterodactyl and payment gateways are
                    configured under Admin → Plugins.
                </p>
            </div>

            <div className="border-t border-zinc-800 pt-8">
                <form onSubmit={onSubmit} className="space-y-6">
                    <DiscordSettings
                        formData={formData}
                        onChange={onFormDataChange}
                    />
                    <div className="flex items-center gap-4 border-t border-zinc-800 pt-6">
                        <Button
                            type="submit"
                            variant="custom"
                            className="bg-green-600 hover:bg-green-700"
                            loading={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Discord Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
