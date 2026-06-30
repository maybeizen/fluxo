import { apiClient } from '@/lib/api-client'
import { type ApplicationSettings } from '@fluxo/types'

export async function fetchSettings(): Promise<ApplicationSettings | null> {
    try {
        const response = await apiClient.get(`/admin/settings`, {})
        return response.data.settings
    } catch (error) {
        console.error('Failed to fetch settings:', error)
        return null
    }
}

export async function updateSettings(
    data: Partial<ApplicationSettings>
): Promise<{
    success: boolean
    message?: string
    settings?: ApplicationSettings
}> {
    try {
        const response = await apiClient.patch(`/admin/settings`, data, {
            withCredentials: true,
        })
        return {
            success: true,
            settings: response.data.settings,
        }
    } catch (error: unknown) {
        console.error('Failed to update settings:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to update settings',
        }
    }
}

export async function uploadLogo(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('logo', file)

    const response = await apiClient.post(`/admin/settings/logo`, formData, {
        withCredentials: true,
    })
    return response.data.logoUrl
}

export async function sendTestEmail(
    email: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await apiClient.post(`/admin/settings/test-email`, {
            email,
        })
        return {
            success: true,
            message: response.data.message,
        }
    } catch (error: unknown) {
        console.error('Failed to send test email:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to send test email',
        }
    }
}
