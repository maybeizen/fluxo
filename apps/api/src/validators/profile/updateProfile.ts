import { z } from 'zod'

export const updateProfileSchema = z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: z.string().email().optional(),
    username: z.string().min(3).max(20).optional(),
    headline: z.string().max(100).optional(),
    about: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
