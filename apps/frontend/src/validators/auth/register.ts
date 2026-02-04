import { z } from 'zod'

export const registerSchema = z
    .object({
        username: z
            .string()
            .min(1, 'Username is required')
            .min(3, 'Username must be at least 3 characters')
            .max(20, 'Username must be at most 20 characters')
            .regex(
                /^[a-zA-Z0-9_-]+$/,
                'Username can only contain letters, numbers, hyphens, and underscores'
            ),
        email: z.email('Please enter a valid email address'),
        firstName: z
            .string()
            .min(1, 'First name is required')
            .min(2, 'First name must be at least 2 characters'),
        lastName: z
            .string()
            .min(1, 'Last name is required')
            .min(2, 'Last name must be at least 2 characters'),
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /[A-Z]/,
                'Password must contain at least one uppercase letter'
            )
            .regex(
                /[a-z]/,
                'Password must contain at least one lowercase letter'
            )
            .regex(/[0-9]/, 'Password must contain at least one number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        turnstileToken: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

export type RegisterFormData = z.infer<typeof registerSchema>
