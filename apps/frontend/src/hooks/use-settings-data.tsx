'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { fetchSettings, updateSettings } from '@/lib/admin/settings'
import { ApplicationSettings, UserRole } from '@fluxo/types'
import { useNotifications } from '@/context/notification-context'
import { useAuth } from '@/context/auth-context'

export function useSettingsData() {
    const router = useRouter()
    const notifications = useNotifications()
    const { user, isLoading: authLoading } = useAuth()
    const hasRedirected = useRef(false)

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [settings, setSettings] = useState<ApplicationSettings | null>(null)
    const [formData, setFormData] = useState({
        appName: '',
        appBaseUrl: '',
        logoUrl: '',
        themeColor: '#ffd952',
        authDisableEmailVerification: false,
        authDisableRegistration: false,
        authDisableLogin: false,
        authDisablePasswordChange: false,
        discordClientId: '',
        discordClientSecret: '',
        discordRedirectUri: '',
        emailSmtpHost: '',
        emailSmtpPort: '',
        emailSmtpUser: '',
        emailSmtpPass: '',
        emailFrom: '',
        cloudflareTurnstileEnabled: false,
        cloudflareTurnstileSiteKey: '',
        cloudflareTurnstileSecretKey: '',
        stripeSecretKey: '',
        stripePublishableKey: '',
    })

    useEffect(() => {
        if (
            !authLoading &&
            user &&
            user.role !== UserRole.ADMIN &&
            !hasRedirected.current
        ) {
            hasRedirected.current = true
            router.replace('/admin/dashboard')
            notifications.error(
                'You do not have permission to access this page'
            )
        }
    }, [user, authLoading])

    useEffect(() => {
        if (!user || user.role !== UserRole.ADMIN) {
            return
        }

        const loadSettings = async () => {
            setIsLoading(true)
            try {
                const data = await fetchSettings()
                if (data) {
                    setSettings(data)
                    setFormData({
                        appName: data.app?.name || '',
                        appBaseUrl: data.app?.baseUrl || '',
                        logoUrl: data.app?.logoUrl || '',
                        themeColor: data.app?.themeColor || '#ffd952',
                        authDisableEmailVerification:
                            data.auth?.disableEmailVerification || false,
                        authDisableRegistration:
                            data.auth?.disableRegistration || false,
                        authDisableLogin: data.auth?.disableLogin || false,
                        authDisablePasswordChange:
                            data.auth?.disablePasswordChange || false,
                        discordClientId: data.discord?.clientId || '',
                        discordClientSecret: '',
                        discordRedirectUri: data.discord?.redirectUri || '',
                        emailSmtpHost: data.email?.smtpHost || '',
                        emailSmtpPort: data.email?.smtpPort?.toString() || '',
                        emailSmtpUser: data.email?.smtpUser || '',
                        emailSmtpPass: '',
                        emailFrom: data.email?.emailFrom || '',
                        stripeSecretKey: '',
                        stripePublishableKey:
                            data.gateways?.stripe?.publishableKey || '',
                        cloudflareTurnstileEnabled:
                            data.security?.cloudflare?.turnstileEnabled ||
                            false,
                        cloudflareTurnstileSiteKey:
                            data.security?.cloudflare?.turnstileSiteKey || '',
                        cloudflareTurnstileSecretKey:
                            data.security?.cloudflare?.turnstileSecretKey || '',
                    })
                }
            } catch (error) {
                console.error('Error loading settings:', error)
                notifications.error('Failed to load settings')
            } finally {
                setIsLoading(false)
            }
        }
        loadSettings()
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user || user.role !== UserRole.ADMIN) {
            notifications.error('You do not have permission to update settings')
            router.replace('/admin/dashboard')
            return
        }

        setIsSaving(true)

        const updates: Partial<ApplicationSettings> = {
            app: {
                name: formData.appName || undefined,
                baseUrl: formData.appBaseUrl || undefined,
                logoUrl: formData.logoUrl || undefined,
                themeColor: formData.themeColor || undefined,
            },
            auth: {
                disableEmailVerification: formData.authDisableEmailVerification,
                disableRegistration: formData.authDisableRegistration,
                disableLogin: formData.authDisableLogin,
                disablePasswordChange: formData.authDisablePasswordChange,
            },
            discord: {
                clientId: formData.discordClientId || undefined,
                clientSecret: formData.discordClientSecret || undefined,
                redirectUri: formData.discordRedirectUri || undefined,
            },
            email: {
                smtpHost: formData.emailSmtpHost || undefined,
                smtpPort: formData.emailSmtpPort
                    ? parseInt(formData.emailSmtpPort)
                    : undefined,
                smtpUser: formData.emailSmtpUser || undefined,
                smtpPass: formData.emailSmtpPass || undefined,
                emailFrom: formData.emailFrom || undefined,
            },
            gateways: {
                stripe: {
                    secretKey: formData.stripeSecretKey || undefined,
                    publishableKey: formData.stripePublishableKey || undefined,
                },
            },
            security: {
                cloudflare: {
                    turnstileEnabled: formData.cloudflareTurnstileEnabled,
                    turnstileSiteKey:
                        formData.cloudflareTurnstileSiteKey || undefined,
                    turnstileSecretKey:
                        formData.cloudflareTurnstileSecretKey || undefined,
                },
            },
        }

        const result = await updateSettings(updates)

        if (result.success) {
            notifications.success('Settings updated successfully')
            if (result.settings) {
                setSettings(result.settings)
            }
        } else {
            notifications.error(result.message || 'Failed to update settings')
        }

        setIsSaving(false)
    }

    const updateFormData = (updates: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...updates }))
    }

    return {
        isLoading,
        isSaving,
        settings,
        formData,
        updateFormData,
        handleSubmit,
        user,
        authLoading,
    }
}
