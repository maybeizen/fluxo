'use client'

import React from 'react'
import { PterodactylSettings } from '@fluxo/types'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'

interface SettingsTabProps {
    formData: {
        baseUrl: string
        apiKey: string
    }
    isSaving: boolean
    isTesting: boolean
    onFormDataChange: (updates: Partial<SettingsTabProps['formData']>) => void
    onSubmit: (e: React.FormEvent) => void
    onTestCredentials: () => void
}

export default function SettingsTab({
    formData,
    isSaving,
    isTesting,
    onFormDataChange,
    onSubmit,
    onTestCredentials,
}: SettingsTabProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                    API Configuration
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <div className="mb-2 flex items-baseline gap-2">
                            <InputLabel
                                htmlFor="baseUrl"
                                required
                                className="mb-0"
                            >
                                Base URL
                            </InputLabel>
                            <div className="group relative">
                                <button
                                    type="button"
                                    className="rounded-full p-0.5 text-zinc-400 transition-colors hover:text-blue-400 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                    aria-label="Base URL requirements"
                                >
                                    <i className="fas fa-question-circle text-sm"></i>
                                </button>
                                <div className="pointer-events-none invisible absolute top-0 left-full z-50 ml-3 w-80 rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-xs text-zinc-300 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                    <div className="absolute top-4 -left-1 h-2 w-2 rotate-45 border-b border-l border-zinc-700 bg-zinc-800"></div>
                                    <div className="relative">
                                        <p className="mb-2.5 text-sm font-semibold text-white">
                                            Base URL Requirements
                                        </p>
                                        <p className="mb-3 leading-relaxed">
                                            The Base URL should{' '}
                                            <strong className="text-primary-300 font-semibold">
                                                NOT
                                            </strong>{' '}
                                            contain a trailing slash.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2 rounded border border-green-500/20 bg-green-500/10 p-2">
                                                <i className="fas fa-check-circle mt-0.5 flex-shrink-0 text-green-400"></i>
                                                <div className="min-w-0 flex-1">
                                                    <p className="mb-0.5 font-medium text-green-400">
                                                        Valid
                                                    </p>
                                                    <code className="rounded bg-zinc-900/50 px-2 py-1 font-mono text-xs break-all text-zinc-200">
                                                        https:
                                                    </code>
                                                </div>
                                            </div>
                                            <div className="border-primary-400/20 bg-primary-400/10 flex items-start gap-2 rounded border p-2">
                                                <i className="fas fa-times-circle text-primary-300 mt-0.5 flex-shrink-0"></i>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-primary-300 mb-0.5 font-medium">
                                                        Invalid
                                                    </p>
                                                    <code className="rounded bg-zinc-900/50 px-2 py-1 font-mono text-xs break-all text-zinc-200">
                                                        https:
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Input
                            id="baseUrl"
                            type="url"
                            value={formData.baseUrl}
                            onChange={(e) =>
                                onFormDataChange({ baseUrl: e.target.value })
                            }
                            placeholder="https://panel.example.com"
                            required
                        />
                        <p className="mt-1 text-xs text-zinc-500">
                            The base URL of your Pterodactyl panel (e.g., https:
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <div className="mb-2 flex items-baseline gap-2">
                            <InputLabel htmlFor="apiKey" className="mb-0">
                                API Key
                            </InputLabel>
                            <div className="group relative">
                                <button
                                    type="button"
                                    className="rounded-full p-0.5 text-zinc-400 transition-colors hover:text-blue-400 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                    aria-label="API Key requirements"
                                >
                                    <i className="fas fa-question-circle text-sm"></i>
                                </button>
                                <div className="pointer-events-none invisible absolute top-0 left-full z-50 ml-3 w-80 rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-xs text-zinc-300 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                    <div className="absolute top-4 -left-1 h-2 w-2 rotate-45 border-b border-l border-zinc-700 bg-zinc-800"></div>
                                    <div className="relative">
                                        <p className="mb-2.5 text-sm font-semibold text-white">
                                            API Key Requirements
                                        </p>
                                        <div className="mb-3 rounded border border-yellow-500/20 bg-yellow-500/10 p-2">
                                            <p className="mb-1.5 leading-relaxed">
                                                The API key must start with{' '}
                                                <code className="rounded bg-zinc-900/50 px-1.5 py-0.5 font-mono font-semibold text-yellow-400">
                                                    ptla_
                                                </code>
                                            </p>
                                        </div>
                                        <p className="mb-2 font-medium text-zinc-200">
                                            Required permissions:
                                        </p>
                                        <ul className="mb-3 space-y-1.5">
                                            <li className="flex items-center gap-2">
                                                <i className="fas fa-check-circle text-xs text-blue-400"></i>
                                                <span>
                                                    Read permission for{' '}
                                                    <strong className="text-white">
                                                        Users
                                                    </strong>
                                                </span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <i className="fas fa-check-circle text-xs text-blue-400"></i>
                                                <span>
                                                    Read permission for{' '}
                                                    <strong className="text-white">
                                                        Nodes
                                                    </strong>
                                                </span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <i className="fas fa-check-circle text-xs text-blue-400"></i>
                                                <span>
                                                    Read permission for{' '}
                                                    <strong className="text-white">
                                                        Servers
                                                    </strong>
                                                </span>
                                            </li>
                                        </ul>
                                        <div className="border-t border-zinc-700 pt-2">
                                            <p className="text-xs leading-relaxed text-zinc-400">
                                                <i className="fas fa-info-circle mr-1.5"></i>
                                                Create an API key in your
                                                Pterodactyl panel under{' '}
                                                <span className="font-medium text-zinc-300">
                                                    Admin → Application API
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Input
                            id="apiKey"
                            type="password"
                            value={formData.apiKey}
                            onChange={(e) =>
                                onFormDataChange({ apiKey: e.target.value })
                            }
                            placeholder="ptla_..."
                        />
                        <div className="mt-2 flex items-center gap-2 text-green-500">
                            <p className="text-xs">Securely encrypted</p>
                            <i className="fas fa-lock text-xs"></i>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                            Your Pterodactyl API key (starts with ptla_). Leave
                            blank to keep current value.
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                <h3 className="mb-4 text-lg font-medium text-white">
                    Test Connection
                </h3>
                <p className="mb-4 text-sm text-zinc-400">
                    Test your Pterodactyl API credentials to ensure they are
                    configured correctly.
                </p>
                <Button
                    type="button"
                    variant="custom"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={onTestCredentials}
                    loading={isTesting}
                    disabled={isTesting || !formData.baseUrl}
                    icon="fas fa-plug"
                >
                    {isTesting ? 'Testing...' : 'Test Credentials'}
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    type="submit"
                    variant="custom"
                    className="bg-green-600 hover:bg-green-700"
                    loading={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </form>
    )
}
