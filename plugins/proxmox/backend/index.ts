import {
    FluxoServerPlugin,
    type PluginSettingsField,
    type ProvisionServiceInput,
    type ProvisionServiceResult,
    type ServicePluginConfigField,
} from '@fluxo/forge'

export default class ProxmoxPlugin extends FluxoServerPlugin {
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
    }

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
    }

    async provisionService(
        input: ProvisionServiceInput
    ): Promise<ProvisionServiceResult> {
        const config = this.ctx.config as { apiUrl?: string; token?: string }
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
    }
}
