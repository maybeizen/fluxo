import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

const migrationsFolder = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../migrations'
)

export async function runMigrations<TSchema extends Record<string, unknown>>(
    db: PostgresJsDatabase<TSchema>
): Promise<void> {
    await migrate(db, { migrationsFolder })
}
