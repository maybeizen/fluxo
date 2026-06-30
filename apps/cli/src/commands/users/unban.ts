import { createLogger } from '@fluxo/logger'
import { users, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import { findUserByIdentifier, formatUserDetail } from '../../utils/users.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'unban',
    description: 'Remove a user ban',
    usage: 'fluxo users unban <id>',
    group: 'Users',
    examples: ['fluxo users unban 5'],
}

export const execute: CommandExecute = async (positionals) => {
    const idArg = positionals[0]
    if (!idArg) {
        throw new Error('User ID is required')
    }

    await withDb(async (db) => {
        const user = await findUserByIdentifier(db, idArg)
        if (!user) {
            throw new Error(`User not found: ${idArg}`)
        }

        const updateData: {
            isBanned: boolean
            updatedAt: Date
            punishmentReferenceId?: null
        } = {
            isBanned: false,
            updatedAt: new Date(),
        }
        if (!user.isTicketBanned) {
            updateData.punishmentReferenceId = null
        }

        await db.update(users).set(updateData).where(eq(users.id, user.id))

        const [updated] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1)

        if (!updated) {
            throw new Error('Failed to load updated user')
        }

        console.log(formatUserDetail(updated))
        logger.success(`Unbanned user ${updated.id}`)
    })
}
