import axios from 'axios'
import { getDb, plugins, users } from '@fluxo/db'
import { eq } from 'drizzle-orm'
import type {
    PluginManifest,
    PluginSettingsField,
    ServicePlugin,
    ServicePluginConfigField,
    ProvisionServiceInput,
    ProvisionServiceResult,
    PluginFieldOption,
    PluginIssue,
} from '@fluxo/types'

const manifest: PluginManifest = {
    id: 'pterodactyl',
    name: 'Pterodactyl',
    version: '1.0.0',
    type: 'service',
    description: 'Provision game servers via Pterodactyl Panel',
    author: 'Fluxo',
}

async function getCredentials(): Promise<{
    baseUrl: string
    apiKey: string
} | null> {
    const db = getDb()
    const [row] = await db
        .select()
        .from(plugins)
        .where(eq(plugins.id, 'pterodactyl'))
        .limit(1)
    const config = row?.config as { baseUrl?: string; apiKey?: string } | null
    if (!config?.baseUrl || !config?.apiKey) return null
    return { baseUrl: config.baseUrl.replace(/\/$/, ''), apiKey: config.apiKey }
}

async function pterodactylRequest<T>(
    baseUrl: string,
    apiKey: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    data?: unknown
): Promise<T> {
    const response = await axios({
        method,
        url: `${baseUrl}/api/application/${endpoint}`,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        data,
        timeout: 15000,
    })
    return response.data
}

const plugin: ServicePlugin = {
    manifest,
    getSettingsSchema(): PluginSettingsField[] {
        return [
            {
                key: 'baseUrl',
                label: 'Panel URL',
                type: 'string',
                required: true,
                placeholder: 'https://panel.example.com',
            },
            {
                key: 'apiKey',
                label: 'Pterodactyl Admin API Key',
                type: 'string',
                required: true,
                secret: true,
            },
        ]
    },
    getConfigFields(): ServicePluginConfigField[] {
        return [
            {
                key: 'locationId',
                label: 'Location',
                type: 'select',
                required: false,
                dynamicOptions: true,
            },
            {
                key: 'nodeId',
                label: 'Node',
                type: 'select',
                required: false,
                dynamicOptions: true,
            },
            {
                key: 'nestId',
                label: 'Nest',
                type: 'select',
                required: true,
                dynamicOptions: true,
            },
            {
                key: 'eggId',
                label: 'Egg',
                type: 'select',
                required: true,
                dynamicOptions: true,
            },
            {
                key: 'memory',
                label: 'Memory (MB)',
                type: 'number',
                required: true,
                min: 0,
            },
            {
                key: 'swap',
                label: 'Swap (MB)',
                type: 'number',
                default: 0,
                min: 0,
            },
            {
                key: 'disk',
                label: 'Disk (MB)',
                type: 'number',
                required: true,
                min: 0,
            },
            { key: 'io', label: 'IO weight', type: 'number', default: 500 },
            { key: 'cpu', label: 'CPU limit (%)', type: 'number', default: 0 },
            {
                key: 'databases',
                label: 'Databases',
                type: 'number',
                default: 0,
                min: 0,
            },
            {
                key: 'backups',
                label: 'Backups',
                type: 'number',
                default: 0,
                min: 0,
            },
        ]
    },
    async getFieldOptions(
        fieldKey: string,
        context: Record<string, unknown>
    ): Promise<PluginFieldOption[]> {
        const creds = await getCredentials()
        if (!creds) return []

        if (fieldKey === 'locationId') {
            const data = await pterodactylRequest<{
                data: Array<{ attributes: { id: number; short: string } }>
            }>(creds.baseUrl, creds.apiKey, 'locations')
            const list =
                (
                    data as {
                        data?: Array<{
                            attributes: { id: number; short: string }
                        }>
                    }
                )?.data ?? []
            return list.map((item) => ({
                value: item.attributes.id,
                label:
                    item.attributes.short || `Location ${item.attributes.id}`,
            }))
        }

        if (fieldKey === 'nodeId') {
            const data = await pterodactylRequest<{
                data: Array<{ attributes: { id: number; name: string } }>
            }>(creds.baseUrl, creds.apiKey, 'nodes')
            const list =
                (
                    data as {
                        data?: Array<{
                            attributes: { id: number; name: string }
                        }>
                    }
                )?.data ?? []
            return list.map((item) => ({
                value: item.attributes.id,
                label: item.attributes.name || `Node ${item.attributes.id}`,
            }))
        }

        if (fieldKey === 'nestId') {
            const data = await pterodactylRequest<{
                data: Array<{ attributes: { id: number; name: string } }>
            }>(creds.baseUrl, creds.apiKey, 'nests')
            const list =
                (
                    data as {
                        data?: Array<{
                            attributes: { id: number; name: string }
                        }>
                    }
                )?.data ?? []
            return list.map((item) => ({
                value: item.attributes.id,
                label: item.attributes.name || `Nest ${item.attributes.id}`,
            }))
        }

        if (fieldKey === 'eggId') {
            const nestId = context.nestId
            if (nestId == null) return []
            const data = await pterodactylRequest<{
                data: Array<{ attributes: { id: number; name: string } }>
            }>(creds.baseUrl, creds.apiKey, `nests/${nestId}/eggs`)
            const list =
                (
                    data as {
                        data?: Array<{
                            attributes: { id: number; name: string }
                        }>
                    }
                )?.data ?? []
            return list.map((item) => ({
                value: item.attributes.id,
                label: item.attributes.name || `Egg ${item.attributes.id}`,
            }))
        }

        return []
    },
    async getIssues(): Promise<PluginIssue[]> {
        const creds = await getCredentials()
        if (!creds)
            return [
                {
                    message: 'Plugin is not configured',
                    severity: 'error',
                    details:
                        'Set Panel URL and Admin API Key in the Options tab.',
                },
            ]
        try {
            await pterodactylRequest(creds.baseUrl, creds.apiKey, 'nodes')
        } catch (err) {
            return [
                {
                    message: 'Cannot reach Pterodactyl Panel',
                    severity: 'error',
                    details: err instanceof Error ? err.message : String(err),
                },
            ]
        }
        return []
    },
    async provisionService(
        input: ProvisionServiceInput
    ): Promise<ProvisionServiceResult> {
        const creds = await getCredentials()
        if (!creds)
            throw new Error(
                'Pterodactyl plugin: configure baseUrl and apiKey in plugin config'
            )

        const {
            nestId,
            eggId,
            memory,
            swap,
            disk,
            io,
            cpu,
            locationId,
            nodeId,
        } = input.pluginConfig as Record<string, number>
        if (!nestId || !eggId || memory == null || disk == null) {
            throw new Error(
                'Pterodactyl plugin: nestId, eggId, memory, disk are required'
            )
        }

        const eggs = await pterodactylRequest<{
            attributes: { docker_image: string; startup: string }
        }>(
            creds.baseUrl,
            creds.apiKey,
            `nests/${nestId}/eggs/${eggId}?include=config,config.variables`
        )
        const eggAttrs = (eggs as any)?.attributes
        const dockerImage =
            eggAttrs?.docker_image ?? 'ghcr.io/pterodactyl/yolks:nodejs_18'
        const startup = eggAttrs?.startup ?? ''

        const db = getDb()
        const [userRow] = await db
            .select({ pterodactylId: users.pterodactylId })
            .from(users)
            .where(eq(users.id, input.userId))
            .limit(1)
        const pterodactylUserId = userRow?.pterodactylId
        if (!pterodactylUserId)
            throw new Error(
                'Pterodactyl plugin: user has no Pterodactyl ID; link the user in Panel first'
            )
        const userId = parseInt(pterodactylUserId, 10)
        if (Number.isNaN(userId))
            throw new Error('Pterodactyl plugin: invalid Pterodactyl user ID')

        const serverPayload = {
            name: input.serviceName,
            user_id: userId,
            egg_id: eggId,
            docker_image: dockerImage,
            startup,
            environment: {},
            limits: { memory, swap, disk, io, cpu: cpu ?? 0 },
            feature_limits: {
                databases: (input.pluginConfig as any).databases ?? 0,
                backups: (input.pluginConfig as any).backups ?? 0,
            },
            allocation: { default: 1, additional: [] },
        }
        if (locationId) (serverPayload as any).location_id = locationId
        if (nodeId) (serverPayload as any).node_id = nodeId

        const created = await pterodactylRequest<{
            attributes: { id: number; identifier: string }
        }>(creds.baseUrl, creds.apiKey, 'servers', 'POST', serverPayload)
        const attrs = (created as any)?.attributes
        const externalId = attrs?.identifier ?? String(attrs?.id ?? '')
        return { externalId }
    },
}

export default plugin
