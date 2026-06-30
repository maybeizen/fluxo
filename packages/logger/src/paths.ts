import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** Walk up from cwd to find the monorepo root (contains bun.lock + workspaces). */
export function findRepoRoot(startDir = process.cwd()): string {
    let dir = startDir
    while (true) {
        const hasLock =
            existsSync(join(dir, 'bun.lock')) ||
            existsSync(join(dir, 'bun.lockb'))
        const hasWorkspaces =
            existsSync(join(dir, 'turbo.json')) && existsSync(join(dir, 'apps'))
        if (hasLock && hasWorkspaces) {
            return dir
        }
        const parent = dirname(dir)
        if (parent === dir) {
            return startDir
        }
        dir = parent
    }
}

export function resolveLogsDir(): string {
    const override = process.env.FLUXO_LOG_DIR
    if (override) {
        return override
    }
    return join(findRepoRoot(), 'logs')
}
