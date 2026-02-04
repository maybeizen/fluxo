import { z } from 'zod'
import { InvoiceStatus, PaymentProvider } from '@fluxo/types'

const invoiceItemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Total must be positive'),
})

export const createInvoiceSchema = z
    .object({
        userId: z.string().uuid('Invalid user ID'),
        serviceId: z.string().uuid('Invalid service ID').optional().nullable(),
        transactionId: z.string().optional().nullable(),
        items: z
            .array(invoiceItemSchema)
            .min(1, 'At least one item is required'),
        status: z.enum(InvoiceStatus).optional(),
        amount: z.number().positive('Amount must be positive'),
        currency: z.string().min(1, 'Currency is required').default('usd'),
        paymentProvider: z.enum(PaymentProvider).optional(),
        expiresAt: z.string().refine((val) => {
            if (!val || val === '') return false
            const date = new Date(val)
            return !isNaN(date.getTime())
        }, 'Valid expiration date is required'),
        metadata: z
            .object({
                planId: z.string().uuid('Invalid product ID'),
                serviceName: z.string().min(1, 'Service name is required'),
                location: z.string().min(1, 'Location is required'),
                dedicatedIP: z.boolean(),
                proxySetup: z.boolean(),
                type: z.string().min(1, 'Type is required'),
                version: z.string().min(1, 'Version is required'),
                isOneTime: z.boolean().optional(),
            })
            .required(),
    })
    .refine(
        (data) => {
            const calculatedTotal = data.items.reduce(
                (sum, item) => sum + item.total,
                0
            )
            return Math.abs(calculatedTotal - data.amount) < 0.01
        },
        {
            message: 'Total amount must match sum of item totals',
            path: ['amount'],
        }
    )

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>
