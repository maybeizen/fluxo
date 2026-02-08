import { readdir, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const COMMANDS_DIR = join(__dirname, 'commands')

/**
 * Recursively find all .js files in a directory.
 * @param {string} dir
 * @param {string[]} basePath - path segments relative to commands dir (e.g. ['user'])
 * @returns {Promise<string[][]>} - array of path segments, e.g. [['setup'], ['user', 'create']]
 */
async function findCommandFiles(dir, basePath = []) {
    const entries = await readdir(dir, { withFileTypes: true })
    const result = []

    for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
            const nested = await findCommandFiles(fullPath, [
                ...basePath,
                entry.name,
            ])
            result.push(...nested)
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            const name = entry.name.slice(0, -3)
            result.push([...basePath, name])
        }
    }

    return result
}

/**
 * Load a single command module and validate it.
 * @param {string} filePath - absolute path to the .js file
 * @param {string} commandKey - e.g. 'setup' or 'user.create'
 * @returns {Promise<{ key: string, data: object, execute: Function } | null>}
 */
async function loadCommandModule(filePath, commandKey) {
    try {
        const mod = await import(pathToFileURL(filePath).href)
        if (
            typeof mod.data !== 'object' ||
            mod.data === null ||
            typeof mod.execute !== 'function'
        ) {
            return null
        }
        const { data, execute } = mod
        if (!data.name) {
            return null
        }
        return {
            key: commandKey,
            data: { ...data },
            execute,
        }
    } catch {
        return null
    }
}

/**
 * Load all commands from the commands directory.
 * @returns {Promise<Map<string, { key: string, data: object, execute: Function }>>}
 *   Map from command key (e.g. 'setup', 'user.create') to command module.
 */
export async function loadCommands() {
    const registry = new Map()

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
            `${segments[segments.length - 1]}.js`
        )
        const cmd = await loadCommandModule(filePath, commandKey)
        if (cmd) {
            registry.set(commandKey, cmd)
        }
    }

    return registry
}
