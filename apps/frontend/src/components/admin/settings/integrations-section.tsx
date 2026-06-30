'use client'

import React, { useState } from 'react'
import DiscordSettings from './discord-settings'
import PterodactylIntegration from './pterodactyl-integration'
import Button from '@/components/ui/button'

type IntegrationType = 'discord' | 'pterodactyl'

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

const integrationTabs = [
    {
        id: 'discord' as IntegrationType,
        label: 'Discord',
        icon: 'fab fa-discord',
        description: 'OAuth integration for user authentication',
    },
    {
        id: 'pterodactyl' as IntegrationType,
        label: 'Pterodactyl',
        icon: 'fas fa-server',
        description: 'Server management and automation',
    },
]

export default function IntegrationsSection({
    formData,
    onFormDataChange,
    onSubmit,
    isSaving,
}: IntegrationsSectionProps) {
    const [activeIntegration, setActiveIntegration] =
        useState<IntegrationType>('discord')

    return (
        <div className="space-y-8">
            <div>
                <h2 className="mb-6 text-xl font-semibold text-white">
                    Integrations
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {integrationTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveIntegration(tab.id)}
                            className={`group relative rounded-lg border p-4 text-left transition-all duration-200 ${
                                activeIntegration === tab.id
                                    ? 'border-primary-400/50 bg-primary-400/5'
                                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                        activeIntegration === tab.id
                                            ? 'bg-primary-400/20 text-primary-400'
                                            : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'
                                    }`}
                                >
                                    <i className={`${tab.icon} text-lg`}></i>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3
                                        className={`font-semibold ${
                                            activeIntegration === tab.id
                                                ? 'text-primary-400'
                                                : 'text-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </h3>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        {tab.description}
                                    </p>
                                </div>
                                {activeIntegration === tab.id && (
                                    <div className="flex-shrink-0">
                                        <div className="bg-primary-400 h-2 w-2 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-zinc-800 pt-8">
                {activeIntegration === 'discord' && (
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
                                {isSaving
                                    ? 'Saving...'
                                    : 'Save Discord Settings'}
                            </Button>
                        </div>
                    </form>
                )}

                {activeIntegration === 'pterodactyl' && (
                    <PterodactylIntegration />
                )}
            </div>
        </div>
    )
}
