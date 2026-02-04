const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export interface AppSettings {
    name?: string
    logoUrl?: string
}

export async function getAppSettings(): Promise<AppSettings | null> {
    try {
        const response = await fetch(`${API_URL}/public/app-settings`, {
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
