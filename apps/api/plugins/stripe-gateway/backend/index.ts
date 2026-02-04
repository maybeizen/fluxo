import Stripe from 'stripe'
import { getDb, plugins, invoices } from '@fluxo/db'
import { eq } from 'drizzle-orm'
import type {
    PluginManifest,
    GatewayPlugin,
    GatewayPaymentRequest,
    GatewayPaymentResult,
    GatewayWebhookPayload,
    PluginSettingsField,
    PluginIssue,
} from '@fluxo/types'

const manifest: PluginManifest = {
    id: 'stripe-gateway',
    name: 'Stripe',
    version: '1.0.0',
    type: 'gateway',
    description: 'Accept payments via Stripe Checkout',
    author: 'Fluxo',
}

async function getStripe(secretKey: string): Promise<Stripe> {
    return new Stripe(secretKey, { apiVersion: '2024-11-20.acacia' })
}

async function getConfig(): Promise<{
    secretKey: string
    webhookSecret?: string
} | null> {
    const db = getDb()
    const [row] = await db
        .select()
        .from(plugins)
        .where(eq(plugins.id, 'stripe-gateway'))
        .limit(1)
    const config = row?.config as {
        secretKey?: string
        webhookSecret?: string
    } | null
    if (!config?.secretKey) return null
    return { secretKey: config.secretKey, webhookSecret: config.webhookSecret }
}

const plugin: GatewayPlugin = {
    manifest,
    getPaymentProviderKey() {
        return 'stripe'
    },
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
    },
    async getIssues(): Promise<PluginIssue[]> {
        const config = await getConfig()
        if (!config)
            return [
                {
                    message: 'Plugin is not configured',
                    severity: 'error',
                    details: 'Set Stripe Secret Key in the Options tab.',
                },
            ]
        return []
    },
    async processPayment(
        request: GatewayPaymentRequest
    ): Promise<GatewayPaymentResult> {
        const config = await getConfig()
        if (!config)
            throw new Error(
                'Stripe plugin: configure secretKey in plugin config'
            )
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
    },
    async handleWebhook(
        payload: GatewayWebhookPayload
    ): Promise<{ invoiceId: number; paid: boolean } | null> {
        const config = await getConfig()
        if (!config?.webhookSecret) return null
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
        return { invoiceId: parseInt(String(invoiceId), 10), paid: true }
    },
}

export default plugin
