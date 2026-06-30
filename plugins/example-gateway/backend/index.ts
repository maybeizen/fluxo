import { createHmac, timingSafeEqual } from 'node:crypto'
import {
    FluxoGatewayPlugin,
    validateConfig,
    type GatewayPaymentRequest,
    type GatewayPaymentResult,
    type GatewayWebhookPayload,
    type PluginIssue,
    type PluginSettingsField,
} from '@fluxo/forge'
import { z } from 'zod'

const configSchema = z.object({
    webhookSecret: z.string().min(8).optional(),
    autoComplete: z.boolean().optional(),
})

export default class ExampleGatewayPlugin extends FluxoGatewayPlugin {
    getPaymentProviderKey(): string {
        return 'example'
    }

    override getSettingsSchema(): PluginSettingsField[] {
        return [
            {
                key: 'webhookSecret',
                label: 'Webhook HMAC Secret',
                type: 'string',
                secret: true,
                placeholder: 'dev-secret',
            },
            {
                key: 'autoComplete',
                label: 'Auto-complete payments (dev)',
                type: 'boolean',
                default: true,
            },
        ]
    }

    override async getIssues(): Promise<PluginIssue[]> {
        const config = validateConfig(
            configSchema,
            this.ctx.config,
            this.manifest.id
        )
        if (!config.webhookSecret) {
            return [
                {
                    message: 'Webhook secret not configured',
                    severity: 'info',
                    details:
                        'Webhooks will not be verified until a secret is set.',
                },
            ]
        }
        return []
    }

    async processPayment(
        request: GatewayPaymentRequest
    ): Promise<GatewayPaymentResult> {
        const config = validateConfig(
            configSchema,
            this.ctx.config,
            this.manifest.id
        )

        if (config.autoComplete) {
            this.emit('payment.succeeded', {
                invoiceId: request.invoiceId,
                gatewayPluginId: this.manifest.id,
            })
            return {
                completed: true,
                transactionId: `mock-${request.invoiceId}`,
            }
        }

        return {
            redirectUrl: `/client/invoices?mockPay=${request.invoiceId}`,
            transactionId: `pending-${request.invoiceId}`,
        }
    }

    override async handleWebhook(
        payload: GatewayWebhookPayload
    ): Promise<{ invoiceId: number; paid: boolean } | null> {
        const config = validateConfig(
            configSchema,
            this.ctx.config,
            this.manifest.id
        )
        const secret = config.webhookSecret ?? 'dev-secret'
        const signature = payload.headers['x-example-signature']
        const body =
            typeof payload.body === 'string'
                ? payload.body
                : JSON.stringify(payload.body)

        if (!signature || !this.verifyHmac(body, signature, secret)) {
            return null
        }

        const data = JSON.parse(body) as { invoiceId?: number; paid?: boolean }
        if (!data.invoiceId) return null

        if (data.paid) {
            this.emit('payment.succeeded', {
                invoiceId: data.invoiceId,
                gatewayPluginId: this.manifest.id,
            })
        }

        return { invoiceId: data.invoiceId, paid: Boolean(data.paid) }
    }

    private verifyHmac(
        body: string,
        signature: string,
        secret: string
    ): boolean {
        const expected = createHmac('sha256', secret).update(body).digest('hex')
        try {
            return timingSafeEqual(
                Buffer.from(expected),
                Buffer.from(signature)
            )
        } catch {
            return false
        }
    }
}
