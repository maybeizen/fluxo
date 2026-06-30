import { createLogger } from '@fluxo/logger'
import { UserRole } from '@fluxo/types'
import { users, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import { findUserByIdentifier, formatUserDetail } from '../../utils/users.js'
import { promptText } from '../../utils/prompts.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'ban',
    description: 'Ban a user',
    usage: 'fluxo users ban <id> [--reason <reference-id>]',
    group: 'Users',
    options: [{ name: 'reason', description: 'Punishment reference ID' }],
    examples: ['fluxo users ban 5', 'fluxo users ban 5 --reason ticket-123'],
}

export const execute: CommandExecute = async (positionals, options) => {
    const idArg = positionals[0]
    if (!idArg) {
        throw new Error('User ID is required')
    }

    const reason =
        typeof options.reason === 'string'
            ? options.reason
            : await promptText('Punishment reference ID (optional)', {
                  defaultValue: '',
              })

    await withDb(async (db) => {
        const user = await findUserByIdentifier(db, idArg)
        if (!user) {
            throw new Error(`User not found: ${idArg}`)
        }

        if (user.role === UserRole.ADMIN) {
            throw new Error('Cannot ban admin users')
        }

        const updateData: {
            isBanned: boolean
            updatedAt: Date
            punishmentReferenceId?: string
        } = {
            isBanned: true,
            updatedAt: new Date(),
        }
        if (reason) {
            updateData.punishmentReferenceId = reason
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
        logger.success(`Banned user ${updated.id}`)
    })
}
