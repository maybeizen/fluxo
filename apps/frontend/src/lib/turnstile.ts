import axios from 'axios'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export async function getTurnstileSiteKey(): Promise<string | null> {
    try {
        const response = await axios.get<{
            success: boolean
            siteKey: string | null
        }>(`${API_URL}/public/turnstile-site-key`, {
            withCredentials: true,
        })

        return response.data.siteKey || null
    } catch (error) {
        console.error('Failed to fetch Turnstile site key:', error)
        return null
    }
}
