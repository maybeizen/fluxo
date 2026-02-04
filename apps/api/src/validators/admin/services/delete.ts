import { z } from 'zod'
import { getDb, services } from '@fluxo/db'
import { eq } from '@fluxo/db'

export const deleteServiceSchema = z
    .object({
        params: z.object({
            id: z.coerce.number().min(1, 'Service ID is required'),
        }),
    })
    .superRefine(async (data, ctx) => {
        const db = getDb()
        const [service] = await db
            .select()
            .from(services)
            .where(eq(services.id, data.params.id))
            .limit(1)
        if (!service) {
            ctx.addIssue({
                code: 'custom',
                message: 'Service not found',
                path: ['params', 'id'],
            })
        }
    })

export type DeleteServiceInput = z.infer<typeof deleteServiceSchema>
