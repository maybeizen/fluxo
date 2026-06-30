'use client'

import React from 'react'
import AppSettings from './app-settings'
import AuthSettings from './auth-settings'
import EmailSettings from './email-settings'
import GatewaysSection from './gateways-settings'
import SecuritySettings from './security-settings'
import ThemeSettings from './theme-settings'
import IntegrationsSection from './integrations-section'
import StorageSettings from './storage-settings'
import Button from '@/components/ui/button'

type TabType =
    | 'app'
    | 'theme'
    | 'auth'
    | 'integrations'
    | 'email'
    | 'storage'
    | 'gateways'
    | 'security'

interface SettingsContentProps {
    activeTab: TabType
    formData: {
        appName: string
        appBaseUrl: string
        logoUrl: string
        themeColor: string
        authDisableEmailVerification: boolean
        authDisableRegistration: boolean
        authDisableLogin: boolean
        authDisablePasswordChange: boolean
        discordClientId: string
        discordClientSecret: string
        discordRedirectUri: string
        emailSmtpHost: string
        emailSmtpPort: string
        emailSmtpUser: string
        emailSmtpPass: string
        emailFrom: string
        storageProvider: 'local' | 's3'
        s3Endpoint: string
        s3Region: string
        s3Bucket: string
        s3AccessKeyId: string
        s3SecretAccessKey: string
        s3ForcePathStyle: boolean
        s3PublicUrlBase: string
        cloudflareTurnstileEnabled: boolean
        cloudflareTurnstileSiteKey: string
        cloudflareTurnstileSecretKey: string
        stripeSecretKey: string
        stripePublishableKey: string
    }
    onFormDataChange: (
        updates: Partial<SettingsContentProps['formData']>
    ) => void
    onSubmit: (e: React.FormEvent) => void
    isSaving: boolean
}

export default function SettingsContent({
    activeTab,
    formData,
    onFormDataChange,
    onSubmit,
    isSaving,
}: SettingsContentProps) {
    if (activeTab === 'integrations') {
        return (
            <IntegrationsSection
                formData={{
                    discordClientId: formData.discordClientId,
                    discordClientSecret: formData.discordClientSecret,
                    discordRedirectUri: formData.discordRedirectUri,
                }}
                onFormDataChange={onFormDataChange}
                onSubmit={onSubmit}
                isSaving={isSaving}
            />
        )
    }

    if (activeTab === 'gateways') {
        return (
            <GatewaysSection
                formData={{
                    stripeSecretKey: formData.stripeSecretKey,
                    stripePublishableKey: formData.stripePublishableKey,
                }}
                onFormDataChange={onFormDataChange}
                onSubmit={onSubmit}
                isSaving={isSaving}
            />
        )
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8">
            {activeTab === 'app' && (
                <AppSettings
                    formData={{
                        appName: formData.appName,
                        appBaseUrl: formData.appBaseUrl,
                        logoUrl: formData.logoUrl,
                    }}
                    onChange={onFormDataChange}
                />
            )}

            {activeTab === 'theme' && (
                <ThemeSettings
                    themeColor={formData.themeColor}
                    onChange={onFormDataChange}
                />
            )}

            {activeTab === 'auth' && (
                <AuthSettings
                    formData={{
                        authDisableEmailVerification:
                            formData.authDisableEmailVerification,
                        authDisableRegistration:
                            formData.authDisableRegistration,
                        authDisableLogin: formData.authDisableLogin,
                        authDisablePasswordChange:
                            formData.authDisablePasswordChange,
                    }}
                    onChange={onFormDataChange}
                />
            )}

            {activeTab === 'email' && (
                <EmailSettings
                    formData={{
                        emailSmtpHost: formData.emailSmtpHost,
                        emailSmtpPort: formData.emailSmtpPort,
                        emailSmtpUser: formData.emailSmtpUser,
                        emailSmtpPass: formData.emailSmtpPass,
                        emailFrom: formData.emailFrom,
                    }}
                    onChange={onFormDataChange}
                />
            )}

            {activeTab === 'storage' && (
                <StorageSettings
                    formData={{
                        storageProvider: formData.storageProvider,
                        s3Endpoint: formData.s3Endpoint,
                        s3Region: formData.s3Region,
                        s3Bucket: formData.s3Bucket,
                        s3AccessKeyId: formData.s3AccessKeyId,
                        s3SecretAccessKey: formData.s3SecretAccessKey,
                        s3ForcePathStyle: formData.s3ForcePathStyle,
                        s3PublicUrlBase: formData.s3PublicUrlBase,
                    }}
                    onChange={onFormDataChange}
                />
            )}

            {activeTab === 'security' && (
                <SecuritySettings
                    formData={{
                        cloudflareTurnstileEnabled:
                            formData.cloudflareTurnstileEnabled,
                        cloudflareTurnstileSiteKey:
                            formData.cloudflareTurnstileSiteKey,
                        cloudflareTurnstileSecretKey:
                            formData.cloudflareTurnstileSecretKey,
                    }}
                    onChange={onFormDataChange}
                />
            )}

            <div className="flex items-center gap-4 border-t border-zinc-800 pt-6">
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
