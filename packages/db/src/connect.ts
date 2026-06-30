import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { runMigrations } from './migrate'
import * as schema from './schema'

interface ConnectArgs {
    uri: string
    /** Run Drizzle migrations on connect. Default true (API startup, `fluxo db migrate`). */
    migrate?: boolean
}

let sql: postgres.Sql | null = null
let dbInstance: ReturnType<typeof drizzle> | null = null

export const connect = async ({ uri, migrate = true }: ConnectArgs) => {
    try {
        if (sql && dbInstance) {
            return dbInstance
        }

        sql = postgres(uri, {
            max: 10,
            idle_timeout: 20,
            connect_timeout: 10,
            // Suppress harmless NOTICE output from idempotent Drizzle migration DDL
            onnotice: () => {},
        })

        dbInstance = drizzle(sql, { schema })

        if (migrate) {
            await runMigrations(dbInstance)
        }

        return dbInstance
    } catch (error: unknown) {
        console.error(
            `Failed to connect to PostgreSQL: ${error instanceof Error ? error.message : String(error)}`
        )
        throw error
    }
}

export const getDb = () => {
    if (!dbInstance) {
        throw new Error('Database not connected. Call connect() first.')
    }
    return dbInstance
}

export const disconnect = async (): Promise<void> => {
    try {
        if (sql) {
            await sql.end()
            sql = null
            dbInstance = null
        }
    } catch (error: unknown) {
        console.error(
            `Failed to disconnect from PostgreSQL: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}

export { dbInstance as db }
