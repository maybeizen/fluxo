import { z } from 'zod'
import { PaymentProvider } from '@fluxo/types'

const invoiceItemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Total must be positive'),
})

export const checkoutInvoiceSchema = z.object({
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().min(1, 'Currency is required').default('usd'),
    paymentProvider: z
        .enum(Object.values(PaymentProvider) as [string, ...string[]])
        .optional()
        .default(PaymentProvider.STRIPE),
    gatewayPluginId: z.string().min(1).optional(),
    transactionId: z.string().optional(),
    serviceId: z.coerce.number().optional(),
    metadata: z
        .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
        .optional(),
    expiresAt: z.coerce.date(),
    returnUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
})

export type CheckoutInvoiceSchema = z.infer<typeof checkoutInvoiceSchema>
