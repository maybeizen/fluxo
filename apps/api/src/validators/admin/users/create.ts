import { z } from 'zod'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { UserRole } from '@fluxo/types'

export const createUserSchema = z
    .object({
        username: z
            .string('Username is required')
            .min(3, 'Username must be at least 3 characters long')
            .max(20, 'Username must be less than 20 characters long')
            .regex(
                /^[a-zA-Z][a-zA-Z0-9._-]*$/,
                'Username must start with a letter and can only contain alphanumeric characters, underscore, dot, or hyphen.'
            )
            .transform((val) => val.toLowerCase()),
        email: z
            .email('Email is required')
            .transform((val) => val.toLowerCase().trim()),
        password: z
            .string('Password is required')
            .min(8, 'Password must be at least 8 characters long')
            .max(64, 'Password must be less than 64 characters long'),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        role: z
            .enum(Object.values(UserRole) as [string, ...string[]])
            .optional(),
        isVerified: z.boolean().optional(),
    })
    .superRefine(async (data, ctx) => {
        const db = getDb()
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1)
        if (user) {
            ctx.addIssue({
                code: 'custom',
                path: ['email'],
                message: 'Email already in use',
            })
        }

        const [usernameExists] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, data.username))
            .limit(1)
        if (usernameExists) {
            ctx.addIssue({
                code: 'custom',
                path: ['username'],
                message: 'Username already in use',
            })
        }
    })
