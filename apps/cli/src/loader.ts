import { readdir, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { CommandModule, CommandRegistry } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const COMMANDS_DIR = join(__dirname, 'commands')

async function findCommandFiles(
    dir: string,
    basePath: string[] = []
): Promise<string[][]> {
    const entries = await readdir(dir, { withFileTypes: true })
    const result: string[][] = []

    for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
            const nested = await findCommandFiles(fullPath, [
                ...basePath,
                entry.name,
            ])
            result.push(...nested)
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            const name = entry.name.slice(0, -3)
            result.push([...basePath, name])
        }
    }

    return result
}

async function loadCommandModule(
    filePath: string,
    commandKey: string
): Promise<CommandModule | null> {
    try {
        const mod = await import(pathToFileURL(filePath).href)
        if (typeof mod.data !== 'object' || typeof mod.execute !== 'function') {
            return null
        }
        if (!mod.data.name) return null
        return { key: commandKey, data: mod.data, execute: mod.execute }
    } catch {
        return null
    }
}

export async function loadCommands(): Promise<CommandRegistry> {
    const registry: CommandRegistry = new Map()

    try {
        await stat(COMMANDS_DIR)
    } catch {
        return registry
    }

    const pathSegments = await findCommandFiles(COMMANDS_DIR)

    for (const segments of pathSegments) {
        const commandKey = segments.join('.')
        const filePath = join(
            COMMANDS_DIR,
            ...segments.slice(0, -1),
            `${segments[segments.length - 1]}.ts`
        )
        const cmd = await loadCommandModule(filePath, commandKey)
        if (cmd) registry.set(commandKey, cmd)
    }

    return registry
}
