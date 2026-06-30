import { createLogger } from '@fluxo/logger'
import { loadCommands } from './loader.js'
import { resolveCommand, routeCommand } from './router.js'
import { showHelp, showCommandHelp } from './help.js'

const logger = createLogger({ source: 'CLI', file: false })
const argv = process.argv.slice(2)

async function main(): Promise<void> {
    const registry = await loadCommands()
    const isHelpArg = (a: string) => a === '--help' || a === '-h'
    const helpIndex = argv.findIndex(isHelpArg)

    if (!argv.length || argv[0] === 'help') {
        const sub = argv[0] === 'help' ? argv[1] : undefined
        if (sub) showCommandHelp(sub, registry)
        else showHelp(registry)
        process.exit(0)
    }

    const resolved = resolveCommand(argv, registry)
    if (!resolved) {
        logger.warn(`Unknown command: ${argv[0]}`)
        console.log('Run fluxo help to see available commands.\n')
        process.exit(1)
    }

    const { commandKey, argv: commandArgv } = resolved
    if (commandArgv.some(isHelpArg) || helpIndex === 0) {
        showCommandHelp(commandKey, registry)
        process.exit(0)
    }

    try {
        const code = await routeCommand(commandKey, commandArgv, registry)
        process.exit(code)
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        logger.error(msg)
        process.exit(1)
    }
}

void main()
