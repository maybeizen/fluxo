import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { z } from 'zod'

export const deleteUserSchema = z
    .object({
        id: z.coerce.number('User ID is required'),
    })
    .superRefine(async (data, ctx) => {
        const db = getDb()
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, data.id))
            .limit(1)
        if (!user) {
            ctx.addIssue({
                code: 'custom',
                path: ['id'],
                message: 'User not found',
            })
        }

        ;(data as any).user = user
    })
    .transform((data) => ({
        user: (data as any).user,
    }))
