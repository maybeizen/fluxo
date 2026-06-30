import type { FluxoLogger } from '@fluxo/logger'
import type { PluginEventBus } from '@fluxo/forge'
import { PluginInvocationError } from '@fluxo/forge'

const QUARANTINE_THRESHOLD = 5
const DEFAULT_INVOKE_TIMEOUT_MS = 30_000

export class SafeInvokeTracker {
    private failureCounts = new Map<string, number>()
    private quarantined = new Set<string>()

    isQuarantined(pluginId: string): boolean {
        return this.quarantined.has(pluginId)
    }

    recordFailure(pluginId: string): boolean {
        const count = (this.failureCounts.get(pluginId) ?? 0) + 1
        this.failureCounts.set(pluginId, count)
        if (count >= QUARANTINE_THRESHOLD) {
            this.quarantined.add(pluginId)
            return true
        }
        return false
    }

    recordSuccess(pluginId: string): void {
        this.failureCounts.delete(pluginId)
        this.quarantined.delete(pluginId)
    }

    reset(pluginId?: string): void {
        if (pluginId) {
            this.failureCounts.delete(pluginId)
            this.quarantined.delete(pluginId)
            return
        }
        this.failureCounts.clear()
        this.quarantined.clear()
    }

    getFailureCount(pluginId: string): number {
        return this.failureCounts.get(pluginId) ?? 0
    }
}

function withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    pluginId: string,
    method: string
): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(
                new PluginInvocationError(
                    `${pluginId}.${method} timed out after ${ms}ms`,
                    pluginId,
                    method
                )
            )
        }, ms)
        promise
            .then((value) => {
                clearTimeout(timer)
                resolve(value)
            })
            .catch((err: unknown) => {
                clearTimeout(timer)
                reject(err)
            })
    })
}

export async function safeInvoke<T>(
    pluginId: string,
    method: string,
    fn: () => Promise<T> | T,
    logger: FluxoLogger,
    events: PluginEventBus,
    tracker: SafeInvokeTracker,
    timeoutMs = DEFAULT_INVOKE_TIMEOUT_MS
): Promise<T> {
    if (tracker.isQuarantined(pluginId)) {
        throw new PluginInvocationError(
            `Plugin ${pluginId} is quarantined due to repeated failures`,
            pluginId,
            method
        )
    }

    try {
        const result = await withTimeout(
            Promise.resolve(fn()),
            timeoutMs,
            pluginId,
            method
        )
        tracker.recordSuccess(pluginId)
        return result
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        logger.error(`Plugin ${pluginId}.${method} failed: ${message}`, {
            source: 'PluginManager',
        })
        await events.emitEvent('plugin.error', {
            pluginId,
            method,
            error: message,
        })
        const quarantined = tracker.recordFailure(pluginId)
        if (quarantined) {
            logger.warn(
                `Plugin ${pluginId} quarantined after repeated failures`,
                {
                    source: 'PluginManager',
                }
            )
        }
        throw err instanceof PluginInvocationError
            ? err
            : new PluginInvocationError(message, pluginId, method)
    }
}
