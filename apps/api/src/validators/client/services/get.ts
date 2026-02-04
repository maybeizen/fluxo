import { z } from 'zod'
import { ServiceStatus } from '@fluxo/types'

export const getMyServicesSchema = z.object({
    query: z.object({
        page: z.string().optional().default('1').transform(Number),
        limit: z.string().optional().default('10').transform(Number),
        status: z
            .enum(Object.values(ServiceStatus) as [string, ...string[]])
            .optional(),
    }),
})

export const getMyServiceByIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().min(1, 'Service ID is required'),
    }),
})

export type GetMyServicesInput = z.infer<typeof getMyServicesSchema>
export type GetMyServiceByIdInput = z.infer<typeof getMyServiceByIdSchema>
