import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getDb, pluginMigrations, eq, and, sql } from '@fluxo/db'
import { logger } from '../../utils/logger'
import { discoverPlugins } from '@fluxo/plugin-loader'

/**
 * Runs pending migrations for all discovered plugins. Call after DB connect and before app start.
 */
export async function runPluginMigrations(pluginsDir: string): Promise<void> {
    const discovered = await discoverPlugins(pluginsDir)
    const db = getDb()

    for (const { dir, manifest } of discovered) {
        const migrationsDir = join(dir, 'migrations')
        let entries: string[]
        try {
            entries = await readdir(migrationsDir)
        } catch {
            continue
        }

        const sqlFiles = entries.filter((f) => f.endsWith('.sql')).sort()
        for (const file of sqlFiles) {
            const migrationName = file.replace(/\.sql$/, '')
            const [existing] = await db
                .select()
                .from(pluginMigrations)
                .where(
                    and(
                        eq(pluginMigrations.id, manifest.id),
                        eq(pluginMigrations.migrationName, migrationName)
                    )
                )
                .limit(1)
            if (existing) continue

            const path = join(migrationsDir, file)
            const content = await readFile(path, 'utf-8')
            const statements = content
                .split(/;\s*-->\s*statement-breakpoint\s*/)
                .map((s) => s.trim())
                .filter(Boolean)
            for (const statement of statements) {
                const s = statement.trim()
                if (!s) continue
                try {
                    await db.execute(sql.raw(s + (s.endsWith(';') ? '' : ';')))
                } catch (err) {
                    logger.error(
                        `Plugin migration ${manifest.id}/${migrationName} failed: ${err}`,
                        { source: 'PluginMigrations' }
                    )
                    throw err
                }
            }
            await db.insert(pluginMigrations).values({
                id: manifest.id,
                migrationName,
            })
            logger.info(
                `Plugin migration applied: ${manifest.id}/${migrationName}`,
                {
                    source: 'PluginMigrations',
                }
            )
        }
    }
}
