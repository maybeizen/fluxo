import {
    pgTable,
    varchar,
    boolean,
    timestamp,
    jsonb,
    index,
} from 'drizzle-orm/pg-core'

export const plugins = pgTable(
    'plugins',
    {
        id: varchar('id', { length: 64 }).primaryKey(),
        name: varchar('name', { length: 255 }).notNull(),
        version: varchar('version', { length: 32 }).notNull(),
        enabled: boolean('enabled').notNull().default(true),
        config: jsonb('config').$type<Record<string, unknown>>(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        enabledIdx: index('plugins_enabled_idx').on(table.enabled),
    })
)

export const pluginMigrations = pgTable(
    'plugin_migrations',
    {
        id: varchar('id', { length: 64 }).notNull(),
        migrationName: varchar('migration_name', { length: 255 }).notNull(),
        executedAt: timestamp('executed_at').notNull().defaultNow(),
    },
    (table) => ({
        pluginIdIdx: index('plugin_migrations_plugin_id_idx').on(table.id),
        uniqueMigration: index('plugin_migrations_unique_idx').on(
            table.id,
            table.migrationName
        ),
    })
)
