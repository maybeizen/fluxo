import axios from 'axios'
import { ApplicationSettings } from '@fluxo/types'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export async function fetchSettings(): Promise<ApplicationSettings | null> {
    try {
        const response = await axios.get(`${API_URL}/admin/settings`, {
            withCredentials: true,
        })
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
        const response = await axios.patch(`${API_URL}/admin/settings`, data, {
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

    const response = await axios.post(
        `${API_URL}/admin/settings/logo`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
        }
    )
    return response.data.logoUrl
}

export async function sendTestEmail(
    email: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await axios.post(
            `${API_URL}/admin/settings/test-email`,
            { email },
            { withCredentials: true }
        )
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
