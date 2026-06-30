import {
    FluxoServerPlugin,
    validateConfig,
    type PluginFieldOption,
    type PluginIssue,
    type ProvisionServiceInput,
    type ProvisionServiceResult,
    type ServicePluginConfigField,
} from '@fluxo/forge'
import { z } from 'zod'

const settingsSchema = z.object({
    mockDelayMs: z.number().min(0).max(5000).optional(),
})

export default class ExampleServicePlugin extends FluxoServerPlugin {
    override async onLoad(): Promise<void> {
        this.ctx.logger.info('Example service plugin loaded', {
            source: this.manifest.id,
        })
    }

    override async onConfigChange(
        newConfig: Readonly<Record<string, unknown>>,
        oldConfig: Readonly<Record<string, unknown>>
    ): Promise<void> {
        this.ctx.logger.debug(
            `Config changed: ${JSON.stringify(oldConfig)} -> ${JSON.stringify(newConfig)}`,
            { source: this.manifest.id }
        )
    }

    getConfigFields(): ServicePluginConfigField[] {
        return [
            {
                key: 'tier',
                label: 'Tier',
                type: 'select',
                required: true,
                options: [
                    { value: 'basic', label: 'Basic' },
                    { value: 'pro', label: 'Pro' },
                ],
            },
            {
                key: 'slots',
                label: 'Slots',
                type: 'number',
                required: true,
                min: 1,
                max: 100,
                default: 1,
            },
            {
                key: 'hostname',
                label: 'Hostname',
                type: 'string',
                placeholder: 'server.example.com',
            },
            {
                key: 'autoBackup',
                label: 'Auto backup',
                type: 'boolean',
                default: true,
            },
            {
                key: 'region',
                label: 'Region',
                type: 'select',
                dynamicOptions: true,
            },
        ]
    }

    override async getFieldOptions(
        fieldKey: string
    ): Promise<PluginFieldOption[]> {
        if (fieldKey === 'region') {
            return [
                { value: 'us-east', label: 'US East' },
                { value: 'eu-west', label: 'EU West' },
            ]
        }
        return []
    }

    override async getIssues(): Promise<PluginIssue[]> {
        const config = validateConfig(
            settingsSchema,
            this.ctx.config,
            this.manifest.id
        )
        if ((config.mockDelayMs ?? 0) > 3000) {
            return [
                {
                    message: 'Mock delay is high',
                    severity: 'warning',
                    details: 'Provisioning may feel slow in development.',
                },
            ]
        }
        return []
    }

    async provisionService(
        input: ProvisionServiceInput
    ): Promise<ProvisionServiceResult> {
        const config = validateConfig(
            settingsSchema,
            this.ctx.config,
            this.manifest.id
        )
        if (config.mockDelayMs) {
            await new Promise((r) => setTimeout(r, config.mockDelayMs))
        }

        const externalId = `example-${input.userId}-${Date.now()}`
        this.ctx.logger.info(
            `Mock provisioned ${externalId} for ${input.serviceName}`,
            {
                source: this.manifest.id,
            }
        )

        return {
            externalId,
            metadata: { mock: true, pluginConfig: input.pluginConfig },
        }
    }
}
