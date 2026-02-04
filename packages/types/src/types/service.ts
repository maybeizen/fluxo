export enum ServiceStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    CANCELLED = 'cancelled',
    DELETED = 'deleted',
}

export enum SoftwareName {
    PurpurMC = 'minecraft_purpurmc',
    Forge = 'minecraft_forge',
    Fabric = 'minecraft_fabric',
    Vanilla = 'minecraft_vanilla',

    Bedrock = 'minecraft_bedrock',
    PocketmineMP = 'minecraft_pocketminemp',

    Velocity = 'velocity',

    Node = 'node',
    Python = 'python',

    ARK = 'ark',
    Valheim = 'valheim',
    Terraria = 'terraria',
    Satisfactory = 'satisfactory',
    Rust = 'rust',
}

export interface CancelledInfo {
    isCancelled: boolean
    cancellationReason: string
    cancellationDate: Date
}

export interface SuspendedInfo {
    isSuspended: boolean
    suspensionReason: string
    suspensionDate: Date
}

export interface SoftwareInfo {
    softwareName: SoftwareName
    version: string
}

export interface Service {
    uuid: string
    product: string
    serviceName: string
    serviceOwnerId: string
    externalId: string

    status: ServiceStatus
    monthlyPrice: number
    dueDate: Date
    creationError: boolean

    location: string
    dedicatedIp: boolean
    proxyAddon: boolean

    cancelled: CancelledInfo
    suspended: SuspendedInfo
    createdAt: Date
    updatedAt: Date
}
