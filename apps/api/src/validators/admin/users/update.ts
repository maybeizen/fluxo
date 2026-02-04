import { getDb, users } from '@fluxo/db'
import { eq, and, ne } from '@fluxo/db'
import { UserRole } from '@fluxo/types'
import { z } from 'zod'

export const updateUserSchema = z
    .object({
        id: z.coerce.number('User ID is required'),
        updates: z
            .object({
                username: z
                    .string('Username is required')
                    .min(3)
                    .max(20)
                    .optional(),
                email: z
                    .email('Invalid email address')
                    .transform((val) => val.toLowerCase().trim())
                    .optional(),
                firstName: z
                    .string('First name is required')
                    .min(1)
                    .max(50)
                    .optional(),
                lastName: z
                    .string('Last name is required')
                    .min(1)
                    .max(50)
                    .optional(),
                role: z
                    .enum(Object.values(UserRole) as [string, ...string[]])
                    .optional(),
                isVerified: z.boolean().optional(),
            })
            .optional()
            .default({}),
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
            return
        }

        const hasUpdates =
            data.updates &&
            Object.keys(data.updates).filter(
                (key) =>
                    data.updates![key as keyof typeof data.updates] !==
                    undefined
            ).length > 0

        if (!hasUpdates) {
            ctx.addIssue({
                code: 'custom',
                path: ['updates'],
                message: 'No updates provided',
            })
            return
        }

        if (data.updates?.username && data.updates.username !== user.username) {
            const [existingUser] = await db
                .select({ id: users.id })
                .from(users)
                .where(
                    and(
                        eq(users.username, data.updates.username),
                        ne(users.id, user.id)
                    )
                )
                .limit(1)
            if (existingUser) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['updates', 'username'],
                    message: 'Username is already taken',
                })
                return
            }
        }

        if (data.updates?.email && data.updates.email !== user.email) {
            const [existingUser] = await db
                .select({ id: users.id })
                .from(users)
                .where(
                    and(
                        eq(users.email, data.updates.email),
                        ne(users.id, user.id)
                    )
                )
                .limit(1)
            if (existingUser) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['updates', 'email'],
                    message: 'Email is already in use',
                })
                return
            }
        }

        ;(data as any).user = user
    })
    .transform((data) => ({
        user: (data as any).user,
        updates: data.updates,
    }))
