export type PluginEventHandler<T = unknown> = (
    payload: T
) => void | Promise<void>

export interface PluginEventMap {
    'payment.succeeded': { invoiceId: number; gatewayPluginId: string }
    'payment.failed': {
        invoiceId: number
        gatewayPluginId: string
        reason?: string
    }
    'plugin.error': {
        pluginId: string
        method: string
        error: string
    }
}

export class PluginEventBus {
    private listeners = new Map<string, Set<PluginEventHandler>>()

    on<K extends keyof PluginEventMap>(
        event: K,
        handler: PluginEventHandler<PluginEventMap[K]>
    ): () => void {
        return this.onEvent(String(event), handler as PluginEventHandler)
    }

    onEvent(event: string, handler: PluginEventHandler): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }
        this.listeners.get(event)!.add(handler)
        return () => {
            this.listeners.get(event)?.delete(handler)
        }
    }

    async emit<K extends keyof PluginEventMap>(
        event: K,
        payload: PluginEventMap[K]
    ): Promise<void> {
        await this.emitEvent(String(event), payload)
    }

    async emitEvent(event: string, payload: unknown): Promise<void> {
        const handlers = this.listeners.get(event)
        if (!handlers) return
        for (const handler of handlers) {
            try {
                await handler(payload)
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err)
                await this.emit('plugin.error', {
                    pluginId: 'event-bus',
                    method: event,
                    error: message,
                })
            }
        }
    }

    off(event: string, handler: PluginEventHandler): void {
        this.listeners.get(event)?.delete(handler)
    }

    clear(): void {
        this.listeners.clear()
    }
}
