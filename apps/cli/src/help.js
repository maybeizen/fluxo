import chalk from 'chalk'
import boxen from 'boxen'

const COMMANDS = [
    {
        name: 'help',
        description: 'Show help (list commands or command-specific help)',
    },
    { name: 'config', description: 'View or set Fluxo configuration' },
    { name: 'plugins', description: 'List and manage plugins' },
    { name: 'status', description: 'Check Fluxo API and services status' },
]

const COMMAND_HELP = {
    help: 'Usage: fluxo help [command]\n\n  With no arguments, lists all commands.\n  With a command name, shows help for that command.',
    config: 'Usage: fluxo config [get|set] [key] [value]\n\n  View or set configuration options. (Placeholder)',
    plugins:
        'Usage: fluxo plugins [list|enable|disable] [id]\n\n  List installed plugins or enable/disable by id. (Placeholder)',
    status: 'Usage: fluxo status\n\n  Check connectivity and status of the Fluxo API. (Placeholder)',
}

export function showHelp() {
    const title = chalk.bold('Fluxo CLI')
    const subtitle = chalk.dim('Manage Fluxo from the command line')
    const header = `${title}\n${subtitle}`

    const rows = COMMANDS.map((c) => {
        const name = chalk.cyan(c.name.padEnd(12))
        return `  ${name} ${chalk.dim(c.description)}`
    }).join('\n')

    const body = chalk.dim('Commands:') + '\n\n' + rows
    const footer = chalk.dim(
        '\nRun fluxo help <command> for command-specific help.'
    )

    const content = header + '\n\n' + body + footer
    const box = boxen(content, {
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        borderColor: 'cyan',
        borderStyle: 'round',
    })
    console.log(box)
}

export function showCommandHelp(commandName) {
    const help = COMMAND_HELP[commandName]
    if (!help) {
        console.log(chalk.yellow(`Unknown command: ${commandName}`))
        console.log(chalk.dim('Run fluxo help to see available commands.\n'))
        return
    }

    const title = chalk.bold(`fluxo ${commandName}`)
    const body = help
    const content = title + '\n\n' + body
    const box = boxen(content, {
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        borderColor: 'gray',
        borderStyle: 'round',
    })
    console.log(box)
}
