import { z } from 'zod'
import { InvoiceStatus, PaymentProvider } from '@fluxo/types'

const invoiceItemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Total must be positive'),
})

export const createInvoiceSchema = z.object({
    userId: z.coerce.number().min(1, 'User ID is required'),
    serviceId: z.coerce.number().optional(),
    transactionId: z.string().optional(),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
    status: z
        .enum(Object.values(InvoiceStatus) as [string, ...string[]])
        .optional()
        .default(InvoiceStatus.PENDING),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().min(1, 'Currency is required').default('usd'),
    metadata: z
        .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
        .optional(),
    paymentProvider: z
        .enum(Object.values(PaymentProvider) as [string, ...string[]])
        .optional()
        .default(PaymentProvider.STRIPE),
    expiresAt: z.coerce.date().optional(),
})

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>
