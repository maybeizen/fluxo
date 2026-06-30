import { apiClient } from '@/lib/api-client'
import type { PluginListItem } from '@/lib/plugins/types'

export type PluginDetail = PluginListItem

export async function fetchAdminPlugins(): Promise<PluginListItem[]> {
    const { data } = await apiClient.get<{
        success: boolean
        plugins: PluginListItem[]
    }>(`/admin/plugins`)
    if (!data.success) throw new Error('Failed to fetch plugins')
    return data.plugins
}

export async function fetchPluginById(
    id: string
): Promise<PluginDetail | null> {
    try {
        const { data } = await apiClient.get<{
            success: boolean
            plugin: PluginDetail
        }>(`/admin/plugins/${id}`)
        return data.success ? data.plugin : null
    } catch {
        return null
    }
}

export async function enablePlugin(
    id: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const { data } = await apiClient.post<{
            success: boolean
            message?: string
        }>(`/admin/plugins/${id}/enable`, {})
        return data
    } catch (err: unknown) {
        const message =
            err && typeof err === 'object' && 'response' in err
                ? (err.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return { success: false, message: message || 'Failed to enable plugin' }
    }
}

export async function disablePlugin(
    id: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const { data } = await apiClient.post<{
            success: boolean
            message?: string
        }>(`/admin/plugins/${id}/disable`, {})
        return data
    } catch (err: unknown) {
        const message =
            err && typeof err === 'object' && 'response' in err
                ? (err.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to disable plugin',
        }
    }
}

export interface PluginFieldOption {
    value: string | number
    label: string
}

export async function fetchPluginFieldOptions(
    pluginId: string,
    fieldKey: string,
    context: Record<string, unknown>
): Promise<PluginFieldOption[]> {
    try {
        const params = new URLSearchParams()
        for (const [k, v] of Object.entries(context)) {
            if (v !== undefined && v !== null && v !== '')
                params.set(k, String(v))
        }
        const qs = params.toString()
        const url = `/admin/plugins/${pluginId}/field-options/${fieldKey}${qs ? `?${qs}` : ''}`
        const { data } = await apiClient.get<{
            success: boolean
            options: PluginFieldOption[]
        }>(url)
        return data.success ? data.options : []
    } catch {
        return []
    }
}

export async function fetchPluginConfig(
    id: string
): Promise<Record<string, unknown> | null> {
    try {
        const { data } = await apiClient.get<{
            success: boolean
            config: Record<string, unknown> | null
        }>(`/admin/plugins/${id}/config`)
        return data.success ? data.config : null
    } catch {
        return null
    }
}

export interface PluginIssue {
    message: string
    severity: 'error' | 'warning' | 'info'
    details?: string
}

export async function fetchPluginIssues(id: string): Promise<PluginIssue[]> {
    try {
        const { data } = await apiClient.get<{
            success: boolean
            issues: PluginIssue[]
        }>(`/admin/plugins/${id}/issues`, {
            withCredentials: true,
        })
        return data.success ? data.issues : []
    } catch {
        return []
    }
}

export async function reloadPlugin(
    id: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const { data } = await apiClient.post<{
            success: boolean
            message?: string
        }>(`/admin/plugins/${id}/reload`, {})
        return data
    } catch (err: unknown) {
        const message =
            err && typeof err === 'object' && 'response' in err
                ? (err.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to reload plugins',
        }
    }
}

export async function updatePluginConfig(
    id: string,
    config: Record<string, unknown>
): Promise<{ success: boolean; message?: string }> {
    try {
        const { data } = await apiClient.patch<{
            success: boolean
            message?: string
        }>(`/admin/plugins/${id}/config`, config, {
            withCredentials: true,
        })
        return data
    } catch (err: unknown) {
        const message =
            err && typeof err === 'object' && 'response' in err
                ? (err.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return { success: false, message: message || 'Failed to update config' }
    }
}
