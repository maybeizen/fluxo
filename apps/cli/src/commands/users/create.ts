import { createLogger } from '@fluxo/logger'
import { UserRole } from '@fluxo/types'
import { withDb } from '../../utils/db.js'
import {
    createUserRecord,
    formatUserDetail,
    passwordSchema,
    userRoleSchema,
    usernameSchema,
} from '../../utils/users.js'
import {
    promptConfirm,
    promptPassword,
    promptSelect,
    promptText,
} from '../../utils/prompts.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'create',
    description: 'Create a new user',
    usage: 'fluxo users create [--email <email>] [--username <name>] [--password <pass>] [--first-name <name>] [--last-name <name>] [--role <role>] [--verified]',
    group: 'Users',
    options: [
        { name: 'email', description: 'Email address' },
        { name: 'username', description: 'Username' },
        { name: 'password', description: 'Password (min 8 chars)' },
        { name: 'first-name', description: 'First name' },
        { name: 'last-name', description: 'Last name' },
        { name: 'role', description: 'Role: admin, staff, user, client' },
        {
            name: 'verified',
            description: 'Mark email as verified',
            type: 'boolean',
        },
    ],
    examples: [
        'fluxo users create --email admin@example.com --username admin --password secret123 --role admin --verified',
        'fluxo users create',
    ],
}

function optString(
    options: Record<string, string | boolean>,
    key: string
): string | undefined {
    const v = options[key]
    return typeof v === 'string' ? v : undefined
}

export const execute: CommandExecute = async (_positionals, options) => {
    const email =
        optString(options, 'email') ??
        (await promptText('Email', {
            validate: (v) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
                    ? undefined
                    : 'Enter a valid email',
        }))

    const username =
        optString(options, 'username') ??
        (await promptText('Username', {
            validate: (v) => {
                const r = usernameSchema.safeParse(v)
                return r.success ? undefined : r.error.issues[0]?.message
            },
        }))

    const password =
        optString(options, 'password') ??
        (await promptPassword('Password', {
            validate: (v) => {
                const r = passwordSchema.safeParse(v)
                return r.success ? undefined : r.error.issues[0]?.message
            },
        }))

    const firstName =
        optString(options, 'first-name') ??
        (await promptText('First name (optional)', { defaultValue: '' }))

    const lastName =
        optString(options, 'last-name') ??
        (await promptText('Last name (optional)', { defaultValue: '' }))

    const role =
        optString(options, 'role') ??
        (await promptSelect('Role', [
            { value: UserRole.USER, label: 'User' },
            { value: UserRole.CLIENT, label: 'Client' },
            { value: UserRole.STAFF, label: 'Staff' },
            { value: UserRole.ADMIN, label: 'Admin' },
        ]))

    userRoleSchema.parse(role)

    const isVerified =
        options.verified === true
            ? true
            : options.verified === false
              ? false
              : await promptConfirm(
                    'Mark email as verified?',
                    role === UserRole.ADMIN
                )

    await withDb(async (db) => {
        const user = await createUserRecord(db, {
            email,
            username,
            password,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            role,
            isVerified,
        })

        console.log(formatUserDetail(user))
        logger.success(`Created user ${user.id} (${user.email})`)
    })
}
