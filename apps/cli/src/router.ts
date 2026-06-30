import type { CommandRegistry } from './types.js'
import { parseArgs } from './parser.js'

export function resolveCommand(
    argv: string[],
    registry: CommandRegistry
): { commandKey: string; argv: string[] } | null {
    if (!argv.length) return null

    let commandKey: string | null = null
    let used = 0

    for (let n = 1; n <= argv.length; n++) {
        const key = argv.slice(0, n).join('.')
        if (registry.has(key)) {
            commandKey = key
            used = n
        }
    }

    if (!commandKey) return null
    return { commandKey, argv: argv.slice(used) }
}

export async function routeCommand(
    commandKey: string,
    argv: string[],
    registry: CommandRegistry
): Promise<number> {
    const cmd = registry.get(commandKey)
    if (!cmd) return 1

    const optionDefs = cmd.data.options ?? []
    const { positionals, options } = parseArgs(argv, optionDefs)
    await cmd.execute(positionals, options)
    return 0
}
