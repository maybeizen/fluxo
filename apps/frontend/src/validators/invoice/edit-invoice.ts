import { z } from 'zod'
import { InvoiceStatus, PaymentProvider } from '@fluxo/types'

const invoiceItemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Total must be positive'),
})

export const editInvoiceSchema = z
    .object({
        userId: z.string().uuid('Invalid user ID').optional(),
        serviceId: z.string().uuid('Invalid service ID').optional().nullable(),
        transactionId: z.string().optional().nullable(),
        items: z
            .array(invoiceItemSchema)
            .min(1, 'At least one item is required')
            .optional(),
        status: z.enum(InvoiceStatus).optional(),
        amount: z.number().positive('Amount must be positive').optional(),
        currency: z.string().min(1, 'Currency is required').optional(),
        paymentProvider: z.enum(PaymentProvider).optional(),
        expiresAt: z
            .string()
            .optional()
            .refine(
                (val) => {
                    if (!val || val === '') return true
                    const date = new Date(val)
                    return !isNaN(date.getTime())
                },
                { message: 'Valid expiration date is required' }
            ),
        paidAt: z
            .string()
            .optional()
            .nullable()
            .refine(
                (val) => {
                    if (!val || val === '') return true
                    const date = new Date(val)
                    return !isNaN(date.getTime())
                },
                { message: 'Valid paid date is required' }
            ),
        expiredAt: z
            .string()
            .optional()
            .nullable()
            .refine(
                (val) => {
                    if (!val || val === '') return true
                    const date = new Date(val)
                    return !isNaN(date.getTime())
                },
                { message: 'Valid expired date is required' }
            ),
    })
    .refine(
        (data) => {
            if (data.items && data.amount) {
                const calculatedTotal = data.items.reduce(
                    (sum, item) => sum + item.total,
                    0
                )
                return Math.abs(calculatedTotal - data.amount) < 0.01
            }
            return true
        },
        {
            message: 'Total amount must match sum of item totals',
            path: ['amount'],
        }
    )

export type EditInvoiceFormData = z.infer<typeof editInvoiceSchema>
