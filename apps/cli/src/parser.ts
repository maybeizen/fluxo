import type { CommandOption } from './types.js'

export function parseArgs(
    argv: string[],
    optionDefs: CommandOption[] = []
): { positionals: string[]; options: Record<string, string | boolean> } {
    const positionals: string[] = []
    const options: Record<string, string | boolean> = {}
    const defByName = new Map(optionDefs.map((d) => [d.name, d]))

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i]
        if (!arg?.startsWith('--')) {
            positionals.push(arg ?? '')
            continue
        }

        const name = arg.slice(2)
        const def = defByName.get(name)
        const next = argv[i + 1]

        if (def?.type === 'boolean' || !next || next.startsWith('--')) {
            options[name] = true
        } else {
            options[name] = next
            i++
        }
    }

    return { positionals, options }
}
