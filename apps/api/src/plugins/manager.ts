import { resolve } from 'node:path'
import {
    getDb,
    plugins,
    users,
    pluginMigrations,
    eq,
    and,
    sql,
} from '@fluxo/db'
import {
    initPluginManager,
    getPluginManager,
    runPluginMigrations,
    type MigrationExecutor,
    type PluginDbAccess,
} from '@fluxo/plugin-manager'
import { logger } from '../utils/logger'

/** Monorepo root /plugins — cwd is apps/api when run via turbo/bun */
export const defaultPluginsDir = resolve(process.cwd(), '../../plugins')

export function createPluginDbAccess(): PluginDbAccess {
    return {
        async getPluginRow(id) {
            const db = getDb()
            const [row] = await db
                .select()
                .from(plugins)
                .where(eq(plugins.id, id))
                .limit(1)
            if (!row) return null
            return {
                enabled: row.enabled,
                config: (row.config as Record<string, unknown>) ?? {},
            }
        },
        async getUser(userId) {
            const db = getDb()
            const [row] = await db
                .select({
                    id: users.id,
                    pterodactylId: users.pterodactylId,
                    email: users.email,
                })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1)
            return row ?? null
        },
    }
}

export function createMigrationExecutor(): MigrationExecutor {
    return {
        async hasMigration(pluginId, migrationName) {
            const db = getDb()
            const [existing] = await db
                .select()
                .from(pluginMigrations)
                .where(
                    and(
                        eq(pluginMigrations.id, pluginId),
                        eq(pluginMigrations.migrationName, migrationName)
                    )
                )
                .limit(1)
            return !!existing
        },
        async executeSql(statement) {
            const db = getDb()
            await db.execute(sql.raw(statement))
        },
        async recordMigration(pluginId, migrationName) {
            const db = getDb()
            await db.insert(pluginMigrations).values({
                id: pluginId,
                migrationName,
            })
        },
    }
}

export async function initPlugins(pluginsDir: string): Promise<void> {
    await runPluginMigrations(pluginsDir, createMigrationExecutor(), logger)
    await initPluginManager({
        pluginsDir,
        dbAccess: createPluginDbAccess(),
        logger,
    })
}

export { getPluginManager, initPluginManager, runPluginMigrations }

/** @deprecated Use getPluginManager */
export function getPluginRegistry() {
    return getPluginManager()
}

/** @deprecated Use initPlugins */
export async function initPluginRegistry(pluginsDir: string): Promise<void> {
    await initPlugins(pluginsDir)
}
