import { z } from 'zod'
import { ServiceStatus } from '@fluxo/types'

export const createServiceSchema = z.object({
    body: z.object({
        product: z.string().min(1, 'Product is required'),
        serviceName: z.string().min(1, 'Service name is required'),
        serviceOwnerId: z.string().min(1, 'Service owner ID is required'),
        externalId: z.string().optional(),
        status: z.enum(ServiceStatus).default(ServiceStatus.ACTIVE),
        monthlyPrice: z
            .number()
            .min(0, 'Monthly price must be non-negative')
            .transform((val) => Math.round(val * 100)),
        dueDate: z.iso.datetime().or(z.date()),
        creationError: z.boolean().default(false),
        location: z.string().min(1, 'Location is required'),
        dedicatedIp: z.boolean().default(false),
        proxyAddon: z.boolean().default(false),
        cancelled: z
            .object({
                isCancelled: z.boolean().default(false),
                cancellationReason: z.string().optional(),
                cancellationDate: z.iso.datetime().or(z.date()).optional(),
            })
            .optional(),
        suspended: z
            .object({
                isSuspended: z.boolean().default(false),
                suspensionReason: z.string().optional(),
                suspensionDate: z.iso.datetime().or(z.date()).optional(),
            })
            .optional(),
    }),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
