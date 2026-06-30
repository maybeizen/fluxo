import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { FluxoLogger } from '@fluxo/logger'
import { discoverPlugins } from './discover.js'

export interface MigrationExecutor {
    hasMigration(pluginId: string, migrationName: string): Promise<boolean>
    executeSql(sql: string): Promise<void>
    recordMigration(pluginId: string, migrationName: string): Promise<void>
}

export async function runPluginMigrations(
    pluginsDir: string,
    executor: MigrationExecutor,
    logger: FluxoLogger
): Promise<void> {
    const discovered = await discoverPlugins(pluginsDir, logger)

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
            const exists = await executor.hasMigration(
                manifest.id,
                migrationName
            )
            if (exists) continue

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
                    await executor.executeSql(s + (s.endsWith(';') ? '' : ';'))
                } catch (err) {
                    logger.error(
                        `Plugin migration ${manifest.id}/${migrationName} failed: ${err}`,
                        { source: 'PluginMigrations' }
                    )
                    throw err
                }
            }

            await executor.recordMigration(manifest.id, migrationName)
            logger.info(
                `Plugin migration applied: ${manifest.id}/${migrationName}`,
                { source: 'PluginMigrations' }
            )
        }
    }
}
