import { z } from 'zod'
import { ServiceStatus } from '@fluxo/types'
import { getDb, services } from '@fluxo/db'
import { eq } from '@fluxo/db'

export const updateServiceSchema = z
    .object({
        params: z.object({
            id: z.coerce.number().min(1, 'Service ID is required'),
        }),
        body: z.object({
            updates: z
                .object({
                    serviceName: z
                        .string()
                        .min(1, 'Service name cannot be empty')
                        .optional(),
                    serviceOwnerId: z.coerce
                        .number()
                        .min(1, 'Service owner ID cannot be empty')
                        .optional(),
                    status: z
                        .enum(
                            Object.values(ServiceStatus) as [
                                string,
                                ...string[],
                            ]
                        )
                        .optional(),
                    monthlyPrice: z
                        .number()
                        .min(0, 'Monthly price must be non-negative')
                        .transform((val) => Math.round(val * 100))
                        .optional(),
                    dueDate: z.iso.datetime().or(z.date()).optional(),
                    creationError: z.boolean().optional(),
                    location: z
                        .string()
                        .min(1, 'Location cannot be empty')
                        .optional(),
                    dedicatedIp: z.boolean().optional(),
                    proxyAddon: z.boolean().optional(),
                    isCancelled: z.boolean().optional(),
                    cancellationReason: z.string().optional(),
                    cancellationDate: z.iso.datetime().or(z.date()).optional(),
                    isSuspended: z.boolean().optional(),
                    suspensionReason: z.string().optional(),
                    suspensionDate: z.iso.datetime().or(z.date()).optional(),
                })
                .optional()
                .default({}),
        }),
    })
    .superRefine(async (data, ctx) => {
        if (Object.keys(data.body.updates).length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'No updates provided',
                path: ['body', 'updates'],
            })
        }

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

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
