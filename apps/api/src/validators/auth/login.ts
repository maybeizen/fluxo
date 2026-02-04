import { z } from 'zod'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import bcrypt from 'bcrypt'

export const loginSchema = z
    .object({
        email: z.email('Invalid email address'),
        password: z.string('Password is required'),
        turnstileToken: z.string().optional(),
        remember: z.boolean().optional().default(false),
        rememberMe: z.boolean().optional(),
    })
    .superRefine(async (data, ctx) => {
        const db = getDb()
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1)

        if (!user) {
            ctx.addIssue({
                code: 'custom',
                path: ['email'],
                message: 'Invalid credentials',
            })
            return
        }

        const isPasswordValid = await bcrypt.compare(
            data.password,
            user.password
        )
        if (!isPasswordValid) {
            ctx.addIssue({
                code: 'custom',
                path: ['password'],
                message: 'Invalid credentials',
            })
            return
        }

        if (!user.isVerified) {
            ctx.addIssue({
                code: 'custom',
                path: ['email'],
                message: 'Please verify your email address before logging in',
            })
            return
        }

        ;(data as any)._user = user
    })
    .transform((data) => {
        const rememberMe = data.rememberMe ?? data.remember ?? false
        return {
            email: data.email,
            password: data.password,
            turnstileToken: data.turnstileToken,
            rememberMe,
            user: (data as any)._user,
        }
    })

export type LoginSchema = z.infer<typeof loginSchema>
