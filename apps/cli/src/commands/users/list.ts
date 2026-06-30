import { createLogger } from '@fluxo/logger'
import { withDb } from '../../utils/db.js'
import { listUsers, printUserTable } from '../../utils/users.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'list',
    description: 'List users with optional filters',
    usage: 'fluxo users list [--role <role>] [--search <term>] [--limit <n>]',
    group: 'Users',
    options: [
        {
            name: 'role',
            description: 'Filter by role (admin, staff, user, client)',
        },
        { name: 'search', description: 'Search email, username, or name' },
        { name: 'limit', description: 'Max rows (default 50)', type: 'number' },
    ],
    examples: [
        'fluxo users list',
        'fluxo users list --role admin',
        'fluxo users list --search alice --limit 10',
    ],
}

export const execute: CommandExecute = async (_positionals, options) => {
    const limitRaw = options.limit
    const limit =
        typeof limitRaw === 'string' ? Number.parseInt(limitRaw, 10) : undefined

    await withDb(async (db) => {
        const { users: rows, total } = await listUsers(db, {
            role: typeof options.role === 'string' ? options.role : undefined,
            search:
                typeof options.search === 'string' ? options.search : undefined,
            limit: limit && Number.isFinite(limit) ? limit : undefined,
        })

        printUserTable(rows)
        logger.info(`Showing ${rows.length} of ${total} user(s)`)
    })
}
