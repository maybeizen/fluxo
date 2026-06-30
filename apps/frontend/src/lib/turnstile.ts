import { apiClient } from '@/lib/api-client'

export async function getTurnstileSiteKey(): Promise<string | null> {
    try {
        const response = await apiClient.get<{
            success: boolean
            siteKey: string | null
        }>(`/public/turnstile-site-key`, {
            withCredentials: true,
        })

        return response.data.siteKey || null
    } catch (error) {
        console.error('Failed to fetch Turnstile site key:', error)
        return null
    }
}
