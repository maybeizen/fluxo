import { z } from 'zod'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'

export const registerSchema = z
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
            .max(64, 'Password must be less than 64 characters long')
            .regex(
                /[a-z]/,
                'Password must contain at least one lowercase letter'
            )
            .regex(
                /[A-Z]/,
                'Password must contain at least one uppercase letter'
            )
            .regex(/\d/, 'Password must contain at least one number')
            .regex(
                /[^a-zA-Z0-9]/,
                'Password must contain at least one special character'
            ),
        confirmPassword: z
            .string('Confirm password is required')
            .min(8, 'Confirm password is required'),
        firstName: z
            .string('First name is required')
            .min(1, 'First name is required'),
        lastName: z
            .string('Last name is required')
            .min(1, 'Last name is required'),
        turnstileToken: z.string().optional(),
    })
    .superRefine(async (data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: 'custom',
                path: ['confirmPassword'],
                message: 'Passwords do not match',
            })
            return
        }

        const db = getDb()
        const [emailExists] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1)
        if (emailExists) {
            ctx.addIssue({
                code: 'custom',
                path: ['email'],
                message: 'Email already exists',
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
                message: 'Username already exists',
            })
        }
    })

type RegisterSchemaInferred = z.infer<typeof registerSchema>

export type RegisterSchema = RegisterSchemaInferred & {
    turnstileToken?: string
}
