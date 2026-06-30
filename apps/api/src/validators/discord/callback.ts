import { z } from 'zod'

export const discordCallbackSchema = z.object({
    code: z.string().min(1, 'Authorization code is required'),
    state: z.string().min(1, 'State is required'),
})

export type DiscordCallbackSchema = z.infer<typeof discordCallbackSchema>
