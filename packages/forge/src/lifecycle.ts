export interface PluginLifecycleHooks {
    onLoad?(): void | Promise<void>
    onEnable?(): void | Promise<void>
    onDisable?(): void | Promise<void>
    onConfigChange?(
        newConfig: Readonly<Record<string, unknown>>,
        oldConfig: Readonly<Record<string, unknown>>
    ): void | Promise<void>
}
