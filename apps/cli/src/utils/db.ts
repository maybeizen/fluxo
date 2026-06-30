import { connect, disconnect, getDb } from '@fluxo/db'

type Db = ReturnType<typeof getDb>

function requirePostgresUrl(): string {
    const uri = process.env.POSTGRES_URL
    if (!uri) {
        throw new Error(
            'POSTGRES_URL is not set. Add it to .env or export it in your shell.'
        )
    }
    return uri
}

export async function withDb<T>(
    fn: (db: Db) => Promise<T>,
    options?: { migrate?: boolean }
): Promise<T> {
    await connect({
        uri: requirePostgresUrl(),
        migrate: options?.migrate ?? false,
    })
    try {
        return await fn(getDb())
    } finally {
        await disconnect()
    }
}
