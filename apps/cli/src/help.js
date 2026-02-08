import chalk from 'chalk'
import boxen from 'boxen'

/**
 * @param {Map<string, { key: string, data: { name: string, group?: string, description?: string } }>} registry
 */
export function showHelp(registry) {
    const title = chalk.bold('Fluxo CLI')
    const subtitle = chalk.dim('Manage Fluxo from the command line')
    const header = `${title}\n${subtitle}`

    const byGroup = new Map()
    byGroup.set('', [])
    for (const [, cmd] of registry) {
        const group = cmd.data.group || ''
        if (!byGroup.has(group)) byGroup.set(group, [])
        byGroup.get(group).push(cmd)
    }

    const rows = []
    const sortedGroups = [...byGroup.keys()].filter(Boolean).sort()
    if (byGroup.get('').length) {
        for (const cmd of byGroup.get('')) {
            const name = chalk.cyan(cmd.key.padEnd(16))
            const desc = (cmd.data.description || '').trim()
            rows.push(`  ${name} ${chalk.dim(desc)}`)
        }
    }
    for (const group of sortedGroups) {
        rows.push('')
        rows.push(chalk.bold(group))
        for (const cmd of byGroup.get(group)) {
            const name = chalk.cyan(`  ${cmd.key}`.padEnd(18))
            const desc = (cmd.data.description || '').trim()
            rows.push(`  ${name} ${chalk.dim(desc)}`)
        }
    }

    const body = chalk.dim('Commands:') + '\n\n' + rows.join('\n')
    const footer = chalk.dim(
        '\nRun fluxo help <command> or fluxo <command> --help for command-specific help.'
    )
    const content = header + '\n\n' + body + footer
    const box = boxen(content, {
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        borderColor: 'cyan',
        borderStyle: 'round',
    })
    console.log(box)
}

/**
 * @param {string} commandKey - e.g. 'setup' or 'user.create'
 * @param {Map<string, { key: string, data: object }>} registry
 */
export function showCommandHelp(commandKey, registry) {
    const cmd = registry.get(commandKey)
    if (!cmd) {
        console.log(chalk.yellow(`Unknown command: ${commandKey}`))
        console.log(chalk.dim('Run fluxo help to see available commands.\n'))
        return
    }

    const { data } = cmd
    const usage = data.usage || `fluxo ${commandKey.replace(/\./g, ' ')}`
    let body = chalk.dim('Usage:') + '\n  ' + usage + '\n'
    if (data.description) {
        body += '\n' + data.description + '\n'
    }
    if (data.options && data.options.length) {
        body += '\n' + chalk.dim('Options:') + '\n'
        for (const opt of data.options) {
            const req = opt.required ? chalk.red(' (required)') : ''
            const type = opt.type ? chalk.dim(` [${opt.type}]`) : ''
            body += `  --${opt.name}${type}${req}  ${opt.description || ''}\n`
        }
    }
    if (data.examples && data.examples.length) {
        body += '\n' + chalk.dim('Examples:') + '\n'
        for (const ex of data.examples) {
            body += '  ' + ex + '\n'
        }
    }

    const title = chalk.bold('fluxo ' + commandKey.replace(/\./g, ' '))
    const content = title + '\n\n' + body
    const box = boxen(content, {
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        borderColor: 'gray',
        borderStyle: 'round',
    })
    console.log(box)
}
