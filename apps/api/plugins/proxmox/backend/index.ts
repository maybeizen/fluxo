import { getDb, plugins } from '@fluxo/db'
import { eq } from 'drizzle-orm'
import type {
    PluginManifest,
    PluginSettingsField,
    ServicePlugin,
    ServicePluginConfigField,
    ProvisionServiceInput,
    ProvisionServiceResult,
} from '@fluxo/types'

const manifest: PluginManifest = {
    id: 'proxmox',
    name: 'Proxmox VE',
    version: '1.0.0',
    type: 'service',
    description: 'Provision VMs/containers via Proxmox VE',
    author: 'Fluxo',
}

async function getConfig(): Promise<{
    apiUrl?: string
    token?: string
} | null> {
    const db = getDb()
    const [row] = await db
        .select()
        .from(plugins)
        .where(eq(plugins.id, 'proxmox'))
        .limit(1)
    const config = row?.config as { apiUrl?: string; token?: string } | null
    return config ?? null
}

const plugin: ServicePlugin = {
    manifest,
    getSettingsSchema(): PluginSettingsField[] {
        return [
            {
                key: 'apiUrl',
                label: 'Proxmox API URL',
                type: 'string',
                required: true,
                placeholder: 'https://pve.example.com:8006',
            },
            {
                key: 'token',
                label: 'API Token',
                type: 'string',
                required: true,
                secret: true,
            },
        ]
    },
    getConfigFields(): ServicePluginConfigField[] {
        return [
            {
                key: 'node',
                label: 'Proxmox node name',
                type: 'string',
                required: true,
            },
            {
                key: 'storage',
                label: 'Storage name',
                type: 'string',
                required: true,
            },
            {
                key: 'template',
                label: 'Template (e.g. ubuntu-22.04)',
                type: 'string',
            },
            {
                key: 'cores',
                label: 'CPU cores',
                type: 'number',
                default: 2,
                min: 1,
            },
            {
                key: 'memory',
                label: 'Memory (MB)',
                type: 'number',
                required: true,
                min: 512,
            },
            {
                key: 'disk',
                label: 'Disk size (GB)',
                type: 'number',
                required: true,
                min: 1,
            },
        ]
    },
    async provisionService(
        input: ProvisionServiceInput
    ): Promise<ProvisionServiceResult> {
        const config = await getConfig()
        if (!config?.apiUrl || !config?.token) {
            throw new Error(
                'Proxmox plugin: configure apiUrl and token in plugin config'
            )
        }
        const { node, storage, template, cores, memory, disk } =
            input.pluginConfig as Record<string, unknown>
        if (!node || !storage || memory == null || disk == null) {
            throw new Error(
                'Proxmox plugin: node, storage, memory, disk are required'
            )
        }

        const externalId = `proxmox-${node}-${Date.now()}`
        return {
            externalId,
            metadata: { node, storage, template, cores, memory, disk },
        }
    },
}

export default plugin
