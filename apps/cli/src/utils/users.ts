import bcrypt from 'bcrypt'
import { UserRole } from '@fluxo/types'
import { z } from 'zod'
import { users, eq, or, and, ilike, sql } from '@fluxo/db'
import type { getDb } from '@fluxo/db'

type Db = ReturnType<typeof getDb>

export const userRoleSchema = z.enum([
    UserRole.ADMIN,
    UserRole.STAFF,
    UserRole.USER,
    UserRole.CLIENT,
])

export const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
        /^[a-zA-Z][a-zA-Z0-9._-]*$/,
        'Username must start with a letter and contain only alphanumeric characters, underscore, dot, or hyphen'
    )
    .transform((val) => val.toLowerCase())

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')

export interface CreateUserInput {
    email: string
    username: string
    password: string
    firstName?: string
    lastName?: string
    role?: string
    isVerified?: boolean
}

export async function createUserRecord(db: Db, input: CreateUserInput) {
    const email = input.email.toLowerCase().trim()
    const username = usernameSchema.parse(input.username)
    passwordSchema.parse(input.password)

    const role = input.role ? userRoleSchema.parse(input.role) : UserRole.USER

    const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
    if (existingEmail) {
        throw new Error(`Email already in use: ${email}`)
    }

    const [existingUsername] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1)
    if (existingUsername) {
        throw new Error(`Username already in use: ${username}`)
    }

    const hashedPassword = await hashPassword(input.password)
    const slug = generateSlug(username)

    const [newUser] = await db
        .insert(users)
        .values({
            email,
            username,
            password: hashedPassword,
            firstName: input.firstName ?? '',
            lastName: input.lastName ?? '',
            slug,
            role,
            isVerified: input.isVerified ?? false,
        })
        .returning()

    if (!newUser) {
        throw new Error('Failed to create user')
    }

    return newUser
}

export function getBcryptRounds(): number {
    const raw = process.env.BCRYPT_ROUNDS
    if (!raw) return 10
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) && n > 0 ? n : 10
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, getBcryptRounds())
}

export function generateSlug(username: string): string {
    const baseSlug = username.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const suffix = Math.floor(Math.random() * 10000)
    return `${baseSlug}-${suffix}`
}

export async function findUserById(db: Db, id: number) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1)
    return user ?? null
}

export async function findUserByEmail(db: Db, email: string) {
    const normalized = email.toLowerCase().trim()
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, normalized))
        .limit(1)
    return user ?? null
}

export async function findUserByUsername(db: Db, username: string) {
    const normalized = username.toLowerCase()
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, normalized))
        .limit(1)
    return user ?? null
}

export async function findUserByIdentifier(db: Db, identifier: string) {
    const trimmed = identifier.trim()
    if (/^\d+$/.test(trimmed)) {
        const byId = await findUserById(db, Number.parseInt(trimmed, 10))
        if (byId) return byId
    }
    if (trimmed.includes('@')) {
        return findUserByEmail(db, trimmed)
    }
    return findUserByUsername(db, trimmed)
}

export const userListColumns = {
    id: users.id,
    email: users.email,
    username: users.username,
    firstName: users.firstName,
    lastName: users.lastName,
    role: users.role,
    isVerified: users.isVerified,
    isBanned: users.isBanned,
    createdAt: users.createdAt,
} as const

export async function listUsers(
    db: Db,
    opts: { role?: string; search?: string; limit?: number }
) {
    const limit = opts.limit ?? 50
    const conditions = []

    if (opts.search) {
        conditions.push(
            or(
                ilike(users.email, `%${opts.search}%`),
                ilike(users.firstName, `%${opts.search}%`),
                ilike(users.lastName, `%${opts.search}%`),
                ilike(users.username, `%${opts.search}%`)
            )
        )
    }

    if (opts.role) {
        conditions.push(
            eq(users.role, opts.role as 'user' | 'admin' | 'staff' | 'client')
        )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const rows = whereClause
        ? await db
              .select(userListColumns)
              .from(users)
              .where(whereClause)
              .orderBy(users.createdAt)
              .limit(limit)
        : await db
              .select(userListColumns)
              .from(users)
              .orderBy(users.createdAt)
              .limit(limit)

    const countResult = whereClause
        ? await db
              .select({ count: sql<number>`count(*)` })
              .from(users)
              .where(whereClause)
        : await db.select({ count: sql<number>`count(*)` }).from(users)

    return {
        users: rows,
        total: Number(countResult[0]?.count ?? 0),
    }
}

export function formatUserDetail(user: {
    id: number
    email: string
    username: string
    firstName: string
    lastName: string
    role: string
    isVerified: boolean
    isBanned: boolean
    isTicketBanned?: boolean
    punishmentReferenceId?: string | null
    slug?: string | null
    createdAt: Date
    updatedAt: Date
}): string {
    const lines = [
        `ID:       ${user.id}`,
        `Email:    ${user.email}`,
        `Username: ${user.username}`,
        `Name:     ${user.firstName} ${user.lastName}`.trim(),
        `Role:     ${user.role}`,
        `Verified: ${user.isVerified ? 'yes' : 'no'}`,
        `Banned:   ${user.isBanned ? 'yes' : 'no'}`,
    ]
    if (user.isTicketBanned !== undefined) {
        lines.push(`Ticket banned: ${user.isTicketBanned ? 'yes' : 'no'}`)
    }
    if (user.punishmentReferenceId) {
        lines.push(`Punishment ref: ${user.punishmentReferenceId}`)
    }
    if (user.slug) lines.push(`Slug:     ${user.slug}`)
    lines.push(`Created:  ${user.createdAt.toISOString()}`)
    lines.push(`Updated:  ${user.updatedAt.toISOString()}`)
    return lines.join('\n')
}

export function printUserTable(
    rows: {
        id: number
        email: string
        username: string
        role: string
        isVerified: boolean
        isBanned: boolean
    }[]
): void {
    if (!rows.length) {
        console.log('No users found.')
        return
    }

    const headers = ['ID', 'Email', 'Username', 'Role', 'Verified', 'Banned']
    const data = rows.map((u) => [
        String(u.id),
        u.email,
        u.username,
        u.role,
        u.isVerified ? 'yes' : 'no',
        u.isBanned ? 'yes' : 'no',
    ])

    const widths = headers.map((h, i) =>
        Math.max(h.length, ...data.map((row) => (row[i] ?? '').length))
    )

    const pad = (s: string, w: number) => s.padEnd(w)
    const headerLine = headers
        .map((h, i) => pad(h, widths[i] ?? h.length))
        .join('  ')
    const sep = widths.map((w) => '-'.repeat(w)).join('  ')
    const body = data
        .map((row) =>
            row.map((cell, i) => pad(cell, widths[i] ?? cell.length)).join('  ')
        )
        .join('\n')

    console.log(`${headerLine}\n${sep}\n${body}`)
}
