import chalk from 'chalk'
import boxen from 'boxen'
import { showHelp, showCommandHelp } from './help.js'

const args = process.argv.slice(2)
const cmd = args[0]
const sub = args[1]

if (!cmd || cmd === 'help') {
    if (sub) {
        showCommandHelp(sub)
    } else {
        showHelp()
    }
    process.exit(0)
}

switch (cmd) {
    default:
        console.log(chalk.yellow(`Unknown command: ${cmd}`))
        console.log(chalk.dim('Run fluxo help to see available commands.\n'))
        process.exit(1)
}
