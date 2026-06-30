'use client'

import { useAppSettings } from '@/context/app-settings-context'

export function useAppLogo() {
    const { logoUrl, appName, isLoading } = useAppSettings()
    return { logoUrl, appName, isLoading }
}
