/**
 * PM2 ecosystem file for Fluxo (API + frontend).
 *
 * Usage:
 *   export FLUXO_ROOT=/opt/fluxo   # optional, default below
 *   pm2 start scripts/ecosystem.config.cjs
 *   pm2 save && pm2 startup
 *
 * See scripts/README.md and DEPLOY.md#process-managers-without-systemd
 */

const fs = require('fs')
const path = require('path')

const ROOT = process.env.FLUXO_ROOT || '/opt/fluxo'

/** Minimal .env loader (no external deps) */
function loadEnvFile(envPath) {
    const env = { NODE_ENV: 'production' }
    if (!fs.existsSync(envPath)) {
        console.warn(`[fluxo pm2] Warning: .env not found at ${envPath}`)
        return env
    }
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        let val = trimmed.slice(eq + 1).trim()
        if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
        ) {
            val = val.slice(1, -1)
        }
        env[key] = val
    }
    return env
}

const env = loadEnvFile(path.join(ROOT, '.env'))

const nodeBin = process.env.FLUXO_NODE || 'node'
const bunBin = process.env.FLUXO_BUN || 'bun'

module.exports = {
    apps: [
        {
            name: 'fluxo-api',
            cwd: ROOT,
            script: path.join(ROOT, 'apps/api/dist/index.js'),
            interpreter: nodeBin,
            env,
            max_restarts: 10,
            restart_delay: 5000,
            merge_logs: true,
            time: true,
        },
        {
            name: 'fluxo-frontend',
            cwd: path.join(ROOT, 'apps/frontend'),
            script: bunBin,
            args: 'run start',
            env,
            max_restarts: 10,
            restart_delay: 5000,
            merge_logs: true,
            time: true,
        },
    ],
}
