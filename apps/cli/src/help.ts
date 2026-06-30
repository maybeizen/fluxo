import chalk from 'chalk'
import boxen from 'boxen'
import type { CommandRegistry } from './types.js'

export function showHelp(registry: CommandRegistry): void {
    const title = chalk.bold('Fluxo CLI')
    const subtitle = chalk.dim('Manage Fluxo from the command line')
    const header = `${title}\n${subtitle}`

    const byGroup = new Map<
        string,
        typeof registry extends Map<string, infer V> ? V[] : never
    >()
    byGroup.set('', [])

    for (const [, cmd] of registry) {
        const group = cmd.data.group || ''
        if (!byGroup.has(group)) byGroup.set(group, [])
        byGroup.get(group)!.push(cmd)
    }

    const rows: string[] = []
    const sortedGroups = [...byGroup.keys()].filter(Boolean).sort()

    for (const cmd of byGroup.get('') ?? []) {
        rows.push(
            `  ${chalk.cyan(cmd.key.padEnd(16))} ${chalk.dim(cmd.data.description ?? '')}`
        )
    }

    for (const group of sortedGroups) {
        rows.push('')
        rows.push(chalk.bold(group))
        for (const cmd of byGroup.get(group) ?? []) {
            rows.push(
                `  ${chalk.cyan(cmd.key.padEnd(18))} ${chalk.dim(cmd.data.description ?? '')}`
            )
        }
    }

    const body = `${chalk.dim('Commands:')}\n\n${rows.join('\n')}`
    const footer = chalk.dim(
        '\nRun fluxo help <command> or fluxo <command> --help for command-specific help.'
    )
    console.log(
        boxen(`${header}\n\n${body}${footer}`, {
            padding: { top: 1, bottom: 1, left: 2, right: 2 },
            borderColor: 'cyan',
            borderStyle: 'round',
        })
    )
}

export function showCommandHelp(
    commandKey: string,
    registry: CommandRegistry
): void {
    const cmd = registry.get(commandKey)
    if (!cmd) {
        console.log(chalk.yellow(`Unknown command: ${commandKey}`))
        console.log(chalk.dim('Run fluxo help to see available commands.\n'))
        return
    }

    const { data } = cmd
    const usage = data.usage ?? `fluxo ${commandKey.replace(/\./g, ' ')}`
    let body = `${chalk.dim('Usage:')}\n  ${usage}\n`
    if (data.description) body += `\n${data.description}\n`
    if (data.options?.length) {
        body += `\n${chalk.dim('Options:')}\n`
        for (const opt of data.options) {
            const req = opt.required ? chalk.red(' (required)') : ''
            const type = opt.type ? chalk.dim(` [${opt.type}]`) : ''
            body += `  --${opt.name}${type}${req}  ${opt.description ?? ''}\n`
        }
    }
    if (data.examples?.length) {
        body += `\n${chalk.dim('Examples:')}\n`
        for (const ex of data.examples) body += `  ${ex}\n`
    }

    console.log(
        boxen(
            `${chalk.bold(`fluxo ${commandKey.replace(/\./g, ' ')}`)}\n\n${body}`,
            {
                padding: { top: 1, bottom: 1, left: 2, right: 2 },
                borderColor: 'gray',
                borderStyle: 'round',
            }
        )
    )
}
