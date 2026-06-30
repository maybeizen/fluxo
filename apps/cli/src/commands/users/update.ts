import { createLogger } from '@fluxo/logger'
import { users, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import {
    findUserByIdentifier,
    formatUserDetail,
    generateSlug,
    userRoleSchema,
    usernameSchema,
} from '../../utils/users.js'
import { promptSelect, promptText } from '../../utils/prompts.js'
import { UserRole } from '@fluxo/types'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'update',
    description: 'Update user fields',
    usage: 'fluxo users update <id> [--email <email>] [--username <name>] [--first-name <name>] [--last-name <name>] [--role <role>] [--verified|--no-verified]',
    group: 'Users',
    options: [
        { name: 'email', description: 'New email' },
        { name: 'username', description: 'New username' },
        { name: 'first-name', description: 'First name' },
        { name: 'last-name', description: 'Last name' },
        { name: 'role', description: 'Role: admin, staff, user, client' },
        {
            name: 'verified',
            description: 'Set verified to true',
            type: 'boolean',
        },
        {
            name: 'no-verified',
            description: 'Set verified to false',
            type: 'boolean',
        },
    ],
    examples: [
        'fluxo users update 1 --role staff',
        'fluxo users update 1 --email new@example.com',
    ],
}

function optString(
    options: Record<string, string | boolean>,
    key: string
): string | undefined {
    const v = options[key]
    return typeof v === 'string' ? v : undefined
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

        const updateData: Record<string, unknown> = { updatedAt: new Date() }
        let changed = false

        const email = optString(options, 'email')
        if (email) {
            updateData.email = email.toLowerCase().trim()
            changed = true
        }

        const username = optString(options, 'username')
        if (username) {
            const parsed = usernameSchema.parse(username)
            updateData.username = parsed
            updateData.slug = generateSlug(parsed)
            changed = true
        }

        const firstName = optString(options, 'first-name')
        if (firstName !== undefined) {
            updateData.firstName = firstName
            changed = true
        }

        const lastName = optString(options, 'last-name')
        if (lastName !== undefined) {
            updateData.lastName = lastName
            changed = true
        }

        const role = optString(options, 'role')
        if (role) {
            updateData.role = userRoleSchema.parse(role)
            changed = true
        }

        if (options.verified === true) {
            updateData.isVerified = true
            changed = true
        } else if (options['no-verified'] === true) {
            updateData.isVerified = false
            changed = true
        }

        if (!changed) {
            const interactiveEmail = await promptText(
                `Email (${user.email}) — press Enter to keep`,
                { defaultValue: user.email }
            )
            if (interactiveEmail !== user.email) {
                updateData.email = interactiveEmail.toLowerCase().trim()
                changed = true
            }

            const interactiveUsername = await promptText(
                `Username (${user.username}) — press Enter to keep`,
                { defaultValue: user.username }
            )
            if (interactiveUsername !== user.username) {
                const parsed = usernameSchema.parse(interactiveUsername)
                updateData.username = parsed
                updateData.slug = generateSlug(parsed)
                changed = true
            }

            const interactiveRole = await promptSelect('Role', [
                { value: UserRole.USER, label: 'User' },
                { value: UserRole.CLIENT, label: 'Client' },
                { value: UserRole.STAFF, label: 'Staff' },
                { value: UserRole.ADMIN, label: 'Admin' },
            ])
            if (interactiveRole !== user.role) {
                updateData.role = interactiveRole
                changed = true
            }
        }

        if (!changed) {
            throw new Error('No updates provided')
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
        logger.success(`Updated user ${updated.id}`)
    })
}
