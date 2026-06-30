export interface PterodactylIntegration {
    enabled: boolean
    locationId?: number
    nodeId?: number
    nestId?: number
    eggId?: number
    memory?: number
    swap?: number
    disk?: number
    io?: number
    cpu?: number
    cpuPinning?: string
    databases?: number
    backups?: number
    additionalAllocations?: number
    oomKiller?: boolean
    skipEggInstallScript?: boolean
    startOnCompletion?: boolean
}

export interface ProductIntegrations {
    pterodactyl?: PterodactylIntegration
    /** Service plugin id (e.g. "pterodactyl", "proxmox") when product uses a plugin for provisioning */
    servicePluginId?: string | null
    /** Plugin-specific config (e.g. nestId, eggId, memory) saved with the product */
    servicePluginConfig?: Record<string, unknown> | null
}
