import { apiClient } from '@/lib/api-client'
import { type PterodactylSettings } from '@fluxo/types'

export interface PterodactylSettingsResponse {
    success: boolean
    message?: string
    settings?: PterodactylSettings
}

export interface TestCredentialsResponse {
    success: boolean
    message?: string
}

export async function fetchPterodactylSettings(): Promise<PterodactylSettings | null> {
    try {
        const response = await apiClient.get<PterodactylSettingsResponse>(
            `/admin/pterodactyl`,
            {
                withCredentials: true,
            }
        )

        if (response.data.success && response.data.settings) {
            return response.data.settings
        }
        return null
    } catch (error) {
        console.error('Failed to fetch Pterodactyl settings:', error)
        return null
    }
}

export async function updatePterodactylSettings(
    data: Partial<PterodactylSettings>
): Promise<PterodactylSettingsResponse> {
    try {
        const response = await apiClient.patch<PterodactylSettingsResponse>(
            `/admin/pterodactyl`,
            data,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to update Pterodactyl settings:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to update Pterodactyl settings',
        }
    }
}

export async function testPterodactylCredentials(): Promise<TestCredentialsResponse> {
    try {
        const response = await apiClient.post<TestCredentialsResponse>(
            `/admin/pterodactyl/test-credentials`,
            {},
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to test Pterodactyl credentials:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to test Pterodactyl credentials',
        }
    }
}

export interface PterodactylDataResponse<T> {
    success: boolean
    data: T[]
    cached?: boolean
    message?: string
}

export interface RefreshResponse {
    success: boolean
    message?: string
    results?: {
        nodes: { success: boolean; data: unknown[]; error?: string }
        users: { success: boolean; data: unknown[]; error?: string }
        servers: { success: boolean; data: unknown[]; error?: string }
    }
}

export async function fetchPterodactylNodes(): Promise<unknown[]> {
    try {
        const response = await apiClient.get<PterodactylDataResponse<unknown>>(
            `/admin/pterodactyl/nodes`,
            {
                withCredentials: true,
            }
        )

        if (response.data.success) {
            return response.data.data || []
        }
        return []
    } catch (error) {
        console.error('Failed to fetch Pterodactyl nodes:', error)
        return []
    }
}

export async function fetchPterodactylUsers(): Promise<unknown[]> {
    try {
        const response = await apiClient.get<PterodactylDataResponse<unknown>>(
            `/admin/pterodactyl/users`,
            {
                withCredentials: true,
            }
        )

        if (response.data.success) {
            return response.data.data || []
        }
        return []
    } catch (error) {
        console.error('Failed to fetch Pterodactyl users:', error)
        return []
    }
}

export async function fetchPterodactylServers(): Promise<unknown[]> {
    try {
        const response = await apiClient.get<PterodactylDataResponse<unknown>>(
            `/admin/pterodactyl/servers`,
            {
                withCredentials: true,
            }
        )

        if (response.data.success) {
            return response.data.data || []
        }
        return []
    } catch (error) {
        console.error('Failed to fetch Pterodactyl servers:', error)
        return []
    }
}

export async function refreshPterodactylData(): Promise<RefreshResponse> {
    try {
        const response = await apiClient.post<RefreshResponse>(
            `/admin/pterodactyl/refresh`,
            {},
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to refresh Pterodactyl data:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to refresh Pterodactyl data',
        }
    }
}

export async function fetchPterodactylLocations(): Promise<unknown[]> {
    try {
        const response = await apiClient.get<PterodactylDataResponse<unknown>>(
            `/admin/pterodactyl/locations`,
            {
                withCredentials: true,
            }
        )

        if (response.data.success) {
            return response.data.data || []
        }
        return []
    } catch (error) {
        console.error('Failed to fetch Pterodactyl locations:', error)
        return []
    }
}

export async function fetchPterodactylNests(): Promise<unknown[]> {
    try {
        const response = await apiClient.get<PterodactylDataResponse<unknown>>(
            `/admin/pterodactyl/nests`,
            {
                withCredentials: true,
            }
        )

        if (response.data.success) {
            return response.data.data || []
        }
        return []
    } catch (error) {
        console.error('Failed to fetch Pterodactyl nests:', error)
        return []
    }
}

export async function fetchPterodactylEggs(nestId: number): Promise<unknown[]> {
    try {
        const response = await apiClient.get<PterodactylDataResponse<unknown>>(
            `/admin/pterodactyl/eggs?nestId=${nestId}`,
            {
                withCredentials: true,
            }
        )

        if (response.data.success) {
            return response.data.data || []
        }
        return []
    } catch (error) {
        console.error('Failed to fetch Pterodactyl eggs:', error)
        return []
    }
}
