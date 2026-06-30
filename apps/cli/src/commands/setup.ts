import type { CommandData, CommandExecute } from '../types.js'

export const data: CommandData = {
    name: 'setup',
    description: 'Run the initial setup wizard',
    usage: 'fluxo setup',
    examples: ['fluxo setup'],
}

export const execute: CommandExecute = async () => {
    console.log('Fluxo setup wizard')
    console.log('Configure POSTGRES_URL, REDIS_URL, and SMTP settings in .env')
    console.log('Then run: bun run fluxo doctor')
}
