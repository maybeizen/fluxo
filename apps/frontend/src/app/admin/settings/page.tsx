'use client'

import React, { useState } from 'react'
import { UserRole } from '@fluxo/types'
import Spinner from '@/components/ui/spinner'
import { useAuth } from '@/context/auth-context'
import { useSettingsData } from '@/hooks/use-settings-data'
import SettingsNavigation from '@/components/admin/settings/settings-navigation'
import SettingsContent from '@/components/admin/settings/settings-content'

type TabType =
    | 'app'
    | 'theme'
    | 'auth'
    | 'integrations'
    | 'email'
    | 'gateways'
    | 'security'

export default function AdminSettingsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const { isLoading, isSaving, formData, updateFormData, handleSubmit } =
        useSettingsData()
    const [activeTab, setActiveTab] = useState<TabType>('app')

    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black px-4 pt-12 pb-6 lg:px-8">
                <Spinner size="xl" />
            </div>
        )
    }

    if (user.role !== UserRole.ADMIN) {
        return null
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-white">
                        Settings
                    </h1>
                    <p className="text-zinc-400">
                        Configure global settings for your Fluxo application
                    </p>
                </div>

                <div>
                    <SettingsNavigation
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <div className="mt-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="rounded-lg bg-zinc-950 p-6 md:p-8">
                                <SettingsContent
                                    activeTab={activeTab}
                                    formData={formData}
                                    onFormDataChange={updateFormData}
                                    onSubmit={handleSubmit}
                                    isSaving={isSaving}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
