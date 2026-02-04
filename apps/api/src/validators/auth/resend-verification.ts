import { z } from 'zod'

export const resendVerificationSchema = z.object({
    email: z.email('Invalid email address'),
})

export type ResendVerificationSchema = z.infer<typeof resendVerificationSchema>
