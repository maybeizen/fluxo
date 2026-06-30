import { createLogger } from '@fluxo/logger'
import { users, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import {
    findUserByIdentifier,
    hashPassword,
    passwordSchema,
} from '../../utils/users.js'
import { promptPassword } from '../../utils/prompts.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'password',
    description: 'Set a new password for a user',
    usage: 'fluxo users password <id> [--password <pass>]',
    group: 'Users',
    options: [{ name: 'password', description: 'New password (min 8 chars)' }],
    examples: ['fluxo users password 1 --password newsecret123'],
}

export const execute: CommandExecute = async (positionals, options) => {
    const idArg = positionals[0]
    if (!idArg) {
        throw new Error('User ID is required')
    }

    const password =
        typeof options.password === 'string'
            ? options.password
            : await promptPassword('New password', {
                  validate: (v) => {
                      const r = passwordSchema.safeParse(v)
                      return r.success ? undefined : r.error.issues[0]?.message
                  },
              })

    passwordSchema.parse(password)

    await withDb(async (db) => {
        const user = await findUserByIdentifier(db, idArg)
        if (!user) {
            throw new Error(`User not found: ${idArg}`)
        }

        const hashed = await hashPassword(password)
        await db
            .update(users)
            .set({ password: hashed, updatedAt: new Date() })
            .where(eq(users.id, user.id))

        logger.success(`Password updated for user ${user.id} (${user.email})`)
    })
}
