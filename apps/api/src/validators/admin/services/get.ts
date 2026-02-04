import { z } from 'zod'
import { ServiceStatus } from '@fluxo/types'

export const getServiceByIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().min(1, 'Service ID is required'),
    }),
})

export const getAllServicesSchema = z.object({
    query: z.object({
        page: z.string().optional().default('1').transform(Number),
        limit: z.string().optional().default('10').transform(Number),
        search: z.string().optional(),
        status: z
            .enum(Object.values(ServiceStatus) as [string, ...string[]])
            .optional(),
        ownerId: z.coerce.number().optional(),
    }),
})

export type GetServiceByIdInput = z.infer<typeof getServiceByIdSchema>
export type GetAllServicesInput = z.infer<typeof getAllServicesSchema>
