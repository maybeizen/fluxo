'use client'

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'
import { API_BASE_URL } from '@/lib/api-client'
import type { AppSettings } from '@/lib/public/app-settings'

interface AppSettingsContextValue extends AppSettings {
    isLoading: boolean
}

const defaultValue: AppSettingsContextValue = {
    logoUrl: undefined,
    name: undefined,
    themeColor: undefined,
    ticketsEnabled: true,
    maintenanceMode: false,
    maintenanceMessage: undefined,
    announcementEnabled: false,
    announcementMessage: undefined,
    isLoading: false,
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(
    undefined
)

let fetchPromise: Promise<AppSettings | null> | null = null

function fetchAppSettingsOnce(): Promise<AppSettings | null> {
    if (!fetchPromise) {
        fetchPromise = (async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/public/app-settings`
                )
                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        return data.settings as AppSettings
                    }
                }
            } catch (error) {
                console.error('Failed to fetch app settings:', error)
            }
            return null
        })()
    }
    return fetchPromise
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchAppSettingsOnce().then((data) => {
            if (data) {
                setSettings(data)
            }
            setIsLoading(false)
        })
    }, [])

    return (
        <AppSettingsContext.Provider value={{ ...settings, isLoading }}>
            {children}
        </AppSettingsContext.Provider>
    )
}

export function useAppSettings(): AppSettingsContextValue {
    const context = useContext(AppSettingsContext)
    return context ?? defaultValue
}
