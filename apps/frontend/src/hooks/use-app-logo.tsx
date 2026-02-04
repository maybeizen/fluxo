'use client'

import { useEffect, useState } from 'react'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

interface AppSettings {
    name?: string
    logoUrl?: string
}

export function useAppLogo() {
    const [logoUrl, setLogoUrl] = useState<string | null>(null)
    const [appName, setAppName] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_URL}/public/app-settings`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.settings) {
                        if (data.settings.logoUrl) {
                            setLogoUrl(data.settings.logoUrl)
                        }
                        if (data.settings.name) {
                            setAppName(data.settings.name)
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch app settings:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSettings()
    }, [])

    return { logoUrl, appName, isLoading }
}
