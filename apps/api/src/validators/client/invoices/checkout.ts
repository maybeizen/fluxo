import { z } from 'zod'
import { PaymentProvider } from '@fluxo/types'

const invoiceItemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Total must be positive'),
})

export const checkoutInvoiceSchema = z
    .object({
        items: z
            .array(invoiceItemSchema)
            .min(1, 'At least one item is required'),
        amount: z.number().positive('Amount must be positive'),
        currency: z.string().min(1, 'Currency is required').default('usd'),
        paymentProvider: z
            .enum(Object.values(PaymentProvider) as [string, ...string[]])
            .optional()
            .default(PaymentProvider.STRIPE),
        gatewayPluginId: z.string().min(1).optional(),
        transactionId: z.string().optional(),
        serviceId: z.coerce.number().optional(),
        productId: z.coerce.number().optional(),
        configurableSelections: z
            .record(z.string(), z.unknown())
            .optional()
            .transform((val) => {
                if (!val) return undefined
                const out: Record<number, unknown> = {}
                for (const [k, v] of Object.entries(val)) {
                    const n = parseInt(k, 10)
                    if (!isNaN(n)) out[n] = v
                }
                return out
            }),
        metadata: z
            .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
            .optional(),
        expiresAt: z.coerce.date(),
        returnUrl: z.string().url().optional(),
        cancelUrl: z.string().url().optional(),
    })
    .refine(
        (data) =>
            !data.configurableSelections ||
            Object.keys(data.configurableSelections).length === 0 ||
            (data.productId !== undefined && data.productId !== null),
        {
            message:
                'productId is required when configurableSelections are provided',
            path: ['productId'],
        }
    )

export type CheckoutInvoiceSchema = z.infer<typeof checkoutInvoiceSchema>
