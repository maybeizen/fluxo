import axios from 'axios'
import type { GatewayPluginListItem, PluginListItem } from './types'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

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
    const { data } = await axios.get<ListPluginsResponse>(
        `${API_URL}/admin/plugins`,
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
    const { data } = await axios.get<GatewayPluginsResponse>(
        `${API_URL}/public/plugins/gateways`,
        {
            withCredentials: true,
        }
    )
    if (!data.success) throw new Error('Failed to fetch gateway plugins')
    return data.gateways
}
