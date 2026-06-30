import Stripe from 'stripe'
import {
    FluxoGatewayPlugin,
    type GatewayPaymentRequest,
    type GatewayPaymentResult,
    type GatewayWebhookPayload,
    type PluginIssue,
    type PluginSettingsField,
} from '@fluxo/forge'

async function getStripe(secretKey: string): Promise<Stripe> {
    return new Stripe(secretKey, { apiVersion: '2026-01-28.clover' })
}

export default class StripeGatewayPlugin extends FluxoGatewayPlugin {
    getPaymentProviderKey(): string {
        return 'stripe'
    }

    getSettingsSchema(): PluginSettingsField[] {
        return [
            {
                key: 'secretKey',
                label: 'Stripe Secret Key',
                type: 'string',
                required: true,
                secret: true,
            },
            {
                key: 'webhookSecret',
                label: 'Webhook Signing Secret',
                type: 'string',
                placeholder: 'whsec_...',
                secret: true,
            },
        ]
    }

    async getIssues(): Promise<PluginIssue[]> {
        const config = this.ctx.config as { secretKey?: string }
        if (!config?.secretKey) {
            return [
                {
                    message: 'Plugin is not configured',
                    severity: 'error',
                    details: 'Set Stripe Secret Key in the Options tab.',
                },
            ]
        }
        return []
    }

    async processPayment(
        request: GatewayPaymentRequest
    ): Promise<GatewayPaymentResult> {
        const config = this.ctx.config as { secretKey?: string }
        if (!config?.secretKey) {
            throw new Error(
                'Stripe plugin: configure secretKey in plugin config'
            )
        }
        const stripe = await getStripe(config.secretKey)
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: request.currency,
                        unit_amount: Math.round(request.amount),
                        product_data: { name: `Invoice #${request.invoiceId}` },
                    },
                    quantity: 1,
                },
            ],
            success_url:
                request.returnUrl ??
                `/client/invoices?paid=${request.invoiceId}`,
            cancel_url: request.cancelUrl ?? '/client/store',
            client_reference_id: String(request.invoiceId),
            metadata: { invoiceId: String(request.invoiceId) },
        })
        return {
            redirectUrl: session.url ?? undefined,
            transactionId: session.id,
        }
    }

    async handleWebhook(
        payload: GatewayWebhookPayload
    ): Promise<{ invoiceId: number; paid: boolean } | null> {
        const config = this.ctx.config as {
            secretKey?: string
            webhookSecret?: string
        }
        if (!config?.secretKey || !config?.webhookSecret) return null
        const stripe = await getStripe(config.secretKey)
        const body = payload.body
        const sig = payload.headers['stripe-signature']
        if (!sig || typeof body !== 'string') return null
        let event: Stripe.Event
        try {
            event = stripe.webhooks.constructEvent(
                body,
                sig,
                config.webhookSecret
            )
        } catch {
            return null
        }
        if (event.type !== 'checkout.session.completed') return null
        const session = event.data.object as Stripe.Checkout.Session
        const invoiceId =
            session.client_reference_id ?? session.metadata?.invoiceId
        if (!invoiceId) return null
        const parsedInvoiceId = parseInt(String(invoiceId), 10)
        this.emit('payment.succeeded', {
            invoiceId: parsedInvoiceId,
            gatewayPluginId: this.manifest.id,
        })
        return { invoiceId: parsedInvoiceId, paid: true }
    }
}
