import { createLogger } from '@fluxo/logger'
import { users, userEmailVerification, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import { findUserByIdentifier, formatUserDetail } from '../../utils/users.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'verify',
    description:
        'Mark a user as verified and remove pending verification token',
    usage: 'fluxo users verify <id|email|username>',
    group: 'Users',
    examples: ['fluxo users verify 1', 'fluxo users verify user@example.com'],
}

export const execute: CommandExecute = async (positionals) => {
    const identifier = positionals[0]
    if (!identifier) {
        throw new Error('User identifier is required')
    }

    await withDb(async (db) => {
        const user = await findUserByIdentifier(db, identifier)
        if (!user) {
            throw new Error(`User not found: ${identifier}`)
        }

        await db
            .update(users)
            .set({ isVerified: true, updatedAt: new Date() })
            .where(eq(users.id, user.id))

        await db
            .delete(userEmailVerification)
            .where(eq(userEmailVerification.userId, user.id))

        const [updated] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1)

        if (!updated) {
            throw new Error('Failed to load updated user')
        }

        console.log(formatUserDetail(updated))
        logger.success(`Verified user ${updated.id}`)
    })
}
