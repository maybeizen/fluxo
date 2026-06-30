export interface ProductIntegrations {
    /** Service plugin id (e.g. "pterodactyl", "proxmox") when product uses a plugin for provisioning */
    servicePluginId?: string | null
    /** Plugin-specific config (e.g. nestId, eggId, memory) saved with the product */
    servicePluginConfig?: Record<string, unknown> | null
}
