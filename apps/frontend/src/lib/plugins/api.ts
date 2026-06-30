import { apiClient } from '@/lib/api-client'
import type { GatewayPluginListItem, PluginListItem } from './types'

export interface ListPluginsResponse {
    success: boolean
    plugins: PluginListItem[]
}

export interface GatewayPluginsResponse {
    success: boolean
    gateways: GatewayPluginListItem[]
}

export async function fetchPluginsList(
    accessToken?: string
): Promise<PluginListItem[]> {
    const { data } = await apiClient.get<ListPluginsResponse>(
        `/admin/plugins`,
        {
            withCredentials: true,
            headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {},
        }
    )
    if (!data.success) throw new Error('Failed to fetch plugins')
    return data.plugins
}

export async function fetchGatewayPlugins(): Promise<GatewayPluginListItem[]> {
    const { data } = await apiClient.get<GatewayPluginsResponse>(
        `/public/plugins/gateways`,
        {
            withCredentials: true,
        }
    )
    if (!data.success) throw new Error('Failed to fetch gateway plugins')
    return data.gateways
}
