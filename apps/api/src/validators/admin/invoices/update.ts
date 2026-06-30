import { z } from 'zod'
import { InvoiceStatus, PaymentProvider } from '@fluxo/types'

const invoiceItemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Total must be positive'),
})

export const updateInvoiceSchema = z.object({
    userId: z.coerce.number().min(1, 'User ID is required').optional(),
    serviceId: z.coerce.number().optional(),
    transactionId: z.string().optional(),
    items: z
        .array(invoiceItemSchema)
        .min(1, 'At least one item is required')
        .optional(),
    status: z
        .enum(Object.values(InvoiceStatus) as [string, ...string[]])
        .optional(),
    amount: z.number().positive('Amount must be positive').optional(),
    currency: z.string().min(1, 'Currency is required').optional(),
    metadata: z
        .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
        .optional(),
    paymentProvider: z
        .enum(Object.values(PaymentProvider) as [string, ...string[]])
        .optional(),
    expiresAt: z.coerce.date().optional(),
    paidAt: z.coerce.date().optional(),
    expiredAt: z.coerce.date().optional(),
})

export type UpdateInvoiceSchema = z.infer<typeof updateInvoiceSchema>
