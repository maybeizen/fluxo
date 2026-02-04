import { z } from 'zod'

export const getProfileSchema = z.object({
    username: z.string().min(1, 'Username is required'),
})

export type GetProfileSchema = z.infer<typeof getProfileSchema>
