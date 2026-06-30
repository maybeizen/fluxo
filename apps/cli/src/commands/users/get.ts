import { createLogger } from '@fluxo/logger'
import { withDb } from '../../utils/db.js'
import { findUserByIdentifier, formatUserDetail } from '../../utils/users.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'get',
    description: 'Show user details by ID, email, or username',
    usage: 'fluxo users get <id|email|username>',
    group: 'Users',
    examples: [
        'fluxo users get 1',
        'fluxo users get admin@example.com',
        'fluxo users get alice',
    ],
}

export const execute: CommandExecute = async (positionals) => {
    const identifier = positionals[0]
    if (!identifier) {
        throw new Error('User identifier is required (id, email, or username)')
    }

    await withDb(async (db) => {
        const user = await findUserByIdentifier(db, identifier)
        if (!user) {
            throw new Error(`User not found: ${identifier}`)
        }

        console.log(formatUserDetail(user))
        logger.success(`User ${user.id} (${user.email})`)
    })
}
