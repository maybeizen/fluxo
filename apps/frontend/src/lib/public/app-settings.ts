import { API_BASE_URL } from '@/lib/api-client'
import type { PublicAppSettings } from '@fluxo/types'

export type AppSettings = PublicAppSettings

export async function getAppSettings(): Promise<AppSettings | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/public/app-settings`, {
            cache: 'no-store',
        })
        if (response.ok) {
            const data = await response.json()
            if (data.success) {
                return data.settings
            }
        }
        return null
    } catch (error) {
        console.error('Failed to fetch app settings:', error)
        return null
    }
}
