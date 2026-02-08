import { parseArgs } from './parser.js'

/**
 * Resolve command key and remaining argv from raw argv.
 * Uses longest match: e.g. ['user', 'create', 'john', '--email', 'x@y.com'] -> { commandKey: 'user.create', argv: ['john', '--email', 'x@y.com'] }
 *
 * @param {string[]} argv - process.argv.slice(2)
 * @param {Map<string, { key: string, data: object, execute: Function }>} registry
 * @returns {{ commandKey: string, argv: string[] } | null}
 */
export function resolveCommand(argv, registry) {
    if (!argv.length) return null

    let commandKey = null
    let used = 0

    for (let n = 1; n <= argv.length; n++) {
        const key = argv.slice(0, n).join('.')
        if (registry.has(key)) {
            commandKey = key
            used = n
        }
    }

    if (!commandKey) return null
    return {
        commandKey,
        argv: argv.slice(used),
    }
}

/**
 * Route to a command's execute function.
 *
 * @param {string} commandKey - e.g. 'setup' or 'user.create'
 * @param {string[]} argv - remaining argv for that command (positionals + options)
 * @param {Map<string, { key: string, data: object, execute: Function }>} registry
 * @returns {Promise<number>} exit code
 */
export async function routeCommand(commandKey, argv, registry) {
    const cmd = registry.get(commandKey)
    if (!cmd) {
        return 1
    }

    const optionDefs = Array.isArray(cmd.data.options) ? cmd.data.options : []
    const { positionals, options } = parseArgs(argv, optionDefs)

    await cmd.execute(positionals, options)
    return 0
}
