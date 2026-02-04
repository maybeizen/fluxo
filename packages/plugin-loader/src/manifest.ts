import type { PluginManifest, PluginType } from '@fluxo/types'

const PLUGIN_TYPES: PluginType[] = ['gateway', 'service']

function isRecord(x: unknown): x is Record<string, unknown> {
    return typeof x === 'object' && x !== null && !Array.isArray(x)
}

/**
 * Validates and normalizes a plugin manifest. Throws if invalid.
 */
export function validateManifest(raw: unknown): PluginManifest {
    if (!isRecord(raw)) {
        throw new Error('Plugin manifest must be an object')
    }
    const id = raw.id
    const name = raw.name
    const version = raw.version
    const type = raw.type

    if (typeof id !== 'string' || id.length === 0) {
        throw new Error('Plugin manifest "id" must be a non-empty string')
    }
    if (!/^[a-z0-9-_]+$/.test(id)) {
        throw new Error(
            'Plugin manifest "id" must contain only lowercase letters, numbers, hyphens, and underscores'
        )
    }
    if (typeof name !== 'string' || name.length === 0) {
        throw new Error('Plugin manifest "name" must be a non-empty string')
    }
    if (typeof version !== 'string' || version.length === 0) {
        throw new Error('Plugin manifest "version" must be a non-empty string')
    }
    if (!PLUGIN_TYPES.includes(type as PluginType)) {
        throw new Error(
            `Plugin manifest "type" must be one of: ${PLUGIN_TYPES.join(', ')}`
        )
    }

    const dependencies = raw.dependencies
    if (dependencies !== undefined) {
        if (!Array.isArray(dependencies)) {
            throw new Error(
                'Plugin manifest "dependencies" must be an array of strings'
            )
        }
        for (const d of dependencies) {
            if (typeof d !== 'string') {
                throw new Error(
                    'Plugin manifest "dependencies" must contain only strings'
                )
            }
        }
    }

    const shipped = raw.shipped
    if (shipped !== undefined && typeof shipped !== 'boolean') {
        throw new Error('Plugin manifest "shipped" must be a boolean')
    }

    return {
        id,
        name,
        version,
        type: type as PluginType,
        dependencies: dependencies as string[] | undefined,
        description:
            typeof raw.description === 'string' ? raw.description : undefined,
        author: typeof raw.author === 'string' ? raw.author : undefined,
        ...(shipped === true && { shipped: true }),
    }
}
