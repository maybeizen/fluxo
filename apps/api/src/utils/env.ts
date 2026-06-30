import { config } from 'dotenv'
import { resolve } from 'node:path'
import { z } from 'zod'

config({ path: resolve(process.cwd(), '../../.env') })

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.coerce.number().default(5001),
    FRONTEND_URL: z.url(),
    API_URL: z.url(),

    ENCRYPTION_KEY: z.string(),

    COOKIE_DOMAIN: z.string().optional(),

    SESSION_SECRET: z.string(),
    SESSION_LIFETIME: z.coerce.number(),
    BCRYPT_ROUNDS: z.coerce.number().default(10),

    POSTGRES_URL: z.string(),
    REDIS_HOST: z.string().default('127.0.0.1'),
    REDIS_PASSWORD: z.string().default('null'),
    REDIS_PORT: z.coerce.number().default(6379),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.email().optional(),

    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    DISCORD_REDIRECT_URI: z.url(),

    APP_NAME: z.string().default('Fluxo'),

    STORAGE_PROVIDER: z.enum(['local', 's3']).optional(),
    STORAGE_DIR: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_FORCE_PATH_STYLE: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) => v === 'true'),
    S3_PUBLIC_URL_BASE: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

let env: z.infer<typeof envSchema>

if (isCI) {
    env = {} as z.infer<typeof envSchema>
} else {
    if (!parsed.success) {
        console.error(
            'Environment validation failed:',
            z.treeifyError(parsed.error)
        )
        throw new Error('Environment variables are missing or invalid.')
    }
    env = parsed.data
}

export { env }
