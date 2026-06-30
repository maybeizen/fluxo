import { createLogger } from '@fluxo/logger'
import { users, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import { findUserByIdentifier } from '../../utils/users.js'
import { promptConfirm } from '../../utils/prompts.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'delete',
    description: 'Permanently delete a user',
    usage: 'fluxo users delete <id> [--yes]',
    group: 'Users',
    options: [
        {
            name: 'yes',
            description: 'Skip confirmation prompt',
            type: 'boolean',
        },
    ],
    examples: ['fluxo users delete 10', 'fluxo users delete 10 --yes'],
}

export const execute: CommandExecute = async (positionals, options) => {
    const idArg = positionals[0]
    if (!idArg) {
        throw new Error('User ID is required')
    }

    await withDb(async (db) => {
        const user = await findUserByIdentifier(db, idArg)
        if (!user) {
            throw new Error(`User not found: ${idArg}`)
        }

        if (options.yes !== true) {
            const confirmed = await promptConfirm(
                `Delete user ${user.id} (${user.email})? This cannot be undone.`,
                false
            )
            if (!confirmed) {
                logger.info('Delete cancelled')
                return
            }
        }

        try {
            await db.delete(users).where(eq(users.id, user.id))
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            throw new Error(
                `Failed to delete user ${user.id}: ${msg}. The user may have related records that block deletion.`
            )
        }

        logger.success(`Deleted user ${user.id} (${user.email})`)
    })
}
