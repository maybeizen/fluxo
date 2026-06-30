export interface AppSettings {
    name?: string
    logoUrl?: string
}

export async function getAppSettings(): Promise<AppSettings | null> {
    try {
        const response = await fetch(`/public/app-settings`, {
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
