import { config } from 'dotenv'
import { resolve } from 'node:path'
import { defineConfig } from 'drizzle-kit'

config({ path: resolve(process.cwd(), '../../.env') })

export default defineConfig({
    schema: './src/schema/index.ts',
    out: './migrations',
    dialect: 'postgresql',

    dbCredentials: {
        url: process.env.POSTGRES_URL || '',
    },
})
