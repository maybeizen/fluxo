import { z } from 'zod'
import { PaymentProvider } from '@fluxo/types'

export const payInvoiceSchema = z.object({
    gatewayPluginId: z.string().min(1).optional(),
    paymentProvider: z
        .enum(Object.values(PaymentProvider) as [string, ...string[]])
        .optional(),
    returnUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
})

export type PayInvoiceSchema = z.infer<typeof payInvoiceSchema>
