import { z } from 'zod'

export const pluginTypeSchema = z.enum(['service', 'gateway', 'theme'])

export type PluginType = z.infer<typeof pluginTypeSchema>

export const pluginManifestSchema = z.object({
    id: z
        .string()
        .min(1)
        .regex(
            /^[a-z0-9-_]+$/,
            'id must contain only lowercase letters, numbers, hyphens, and underscores'
        ),
    name: z.string().min(1),
    version: z.string().min(1),
    author: z.string().min(1),
    type: pluginTypeSchema,
    dependencies: z.array(z.string()).optional(),
    description: z.string().optional(),
    shipped: z.boolean().optional(),
})

export type PluginManifest = z.infer<typeof pluginManifestSchema>

export function validateManifest(raw: unknown): PluginManifest {
    return pluginManifestSchema.parse(raw)
}
