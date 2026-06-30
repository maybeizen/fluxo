import { createLogger } from '@fluxo/logger'
import { users, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import {
    findUserByIdentifier,
    formatUserDetail,
    userRoleSchema,
} from '../../utils/users.js'
import { promptSelect } from '../../utils/prompts.js'
import { UserRole } from '@fluxo/types'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'role',
    description: 'Change a user role',
    usage: 'fluxo users role <id> [role]',
    group: 'Users',
    examples: ['fluxo users role 1 admin', 'fluxo users role 2 staff'],
}

export const execute: CommandExecute = async (positionals) => {
    const idArg = positionals[0]
    if (!idArg) {
        throw new Error('User ID is required')
    }

    let roleArg = positionals[1]
    if (!roleArg) {
        roleArg = await promptSelect('Select role', [
            { value: UserRole.USER, label: 'User' },
            { value: UserRole.CLIENT, label: 'Client' },
            { value: UserRole.STAFF, label: 'Staff' },
            { value: UserRole.ADMIN, label: 'Admin' },
        ])
    }

    const role = userRoleSchema.parse(roleArg)

    await withDb(async (db) => {
        const user = await findUserByIdentifier(db, idArg)
        if (!user) {
            throw new Error(`User not found: ${idArg}`)
        }

        await db
            .update(users)
            .set({ role, updatedAt: new Date() })
            .where(eq(users.id, user.id))

        const [updated] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1)

        if (!updated) {
            throw new Error('Failed to load updated user')
        }

        console.log(formatUserDetail(updated))
        logger.success(`Set role for user ${updated.id} to ${role}`)
    })
}
