import type { z } from 'zod'

export class PluginConfigError extends Error {
    readonly pluginId?: string
    readonly issues: z.ZodIssue[]

    constructor(message: string, issues: z.ZodIssue[], pluginId?: string) {
        super(message)
        this.name = 'PluginConfigError'
        this.issues = issues
        this.pluginId = pluginId
    }
}

export class PluginValidationError extends Error {
    readonly pluginId: string
    readonly field?: string

    constructor(message: string, pluginId: string, field?: string) {
        super(message)
        this.name = 'PluginValidationError'
        this.pluginId = pluginId
        this.field = field
    }
}

export class PluginInvocationError extends Error {
    readonly pluginId: string
    readonly method: string

    constructor(message: string, pluginId: string, method: string) {
        super(message)
        this.name = 'PluginInvocationError'
        this.pluginId = pluginId
        this.method = method
    }
}

export function validateConfig<T extends z.ZodType>(
    schema: T,
    config: unknown,
    pluginId?: string
): z.infer<T> {
    const result = schema.safeParse(config)
    if (!result.success) {
        throw new PluginConfigError(
            `Invalid plugin config${pluginId ? ` for ${pluginId}` : ''}`,
            result.error.issues,
            pluginId
        )
    }
    return result.data
}
