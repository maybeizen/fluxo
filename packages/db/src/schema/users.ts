import {
    pgTable,
    serial,
    varchar,
    text,
    boolean,
    timestamp,
    integer,
    pgEnum,
    index,
} from 'drizzle-orm/pg-core'
import { userRoleEnum } from './enums'

export const users = pgTable(
    'users',
    {
        id: serial('id').primaryKey(),
        email: varchar('email', { length: 255 }).notNull().unique(),
        password: varchar('password', { length: 255 }).notNull(),
        firstName: varchar('first_name', { length: 255 }).notNull().default(''),
        lastName: varchar('last_name', { length: 255 }).notNull().default(''),
        role: userRoleEnum('role').notNull().default('user'),
        isVerified: boolean('is_verified').notNull().default(false),
        pterodactylId: varchar('pterodactyl_id', { length: 255 }),

        username: varchar('username', { length: 255 }).notNull().unique(),
        slug: varchar('slug', { length: 255 }).unique(),
        headline: text('headline'),
        about: text('about'),
        avatarUrl: varchar('avatar_url', { length: 500 }),

        isBanned: boolean('is_banned').notNull().default(false),
        isTicketBanned: boolean('is_ticket_banned').notNull().default(false),
        punishmentReferenceId: varchar('punishment_reference_id', {
            length: 255,
        }),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        emailIdx: index('users_email_idx').on(table.email),
        usernameIdx: index('users_username_idx').on(table.username),
        slugIdx: index('users_slug_idx').on(table.slug),
        roleIdx: index('users_role_idx').on(table.role),
    })
)

export const userDiscord = pgTable('user_discord', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' })
        .unique(),
    discordId: varchar('discord_id', { length: 255 }),
    discordUsername: varchar('discord_username', { length: 255 }),
    discordAvatarHash: varchar('discord_avatar_hash', { length: 255 }),
    discordAccessToken: text('discord_access_token'),
    discordRefreshToken: text('discord_refresh_token'),
    discordTokenExpiresAt: timestamp('discord_token_expires_at'),
})

export const userPasswordReset = pgTable('user_password_reset', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' })
        .unique(),
    token: varchar('token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
})

export const userEmailVerification = pgTable('user_email_verification', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' })
        .unique(),
    token: varchar('token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
})
