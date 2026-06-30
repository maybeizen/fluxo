import {
    FluxoServerPlugin,
    type PluginContext,
    type PluginFieldOption,
    type PluginIssue,
    type PluginSettingsField,
    type ProvisionServiceInput,
    type ProvisionServiceResult,
    type ServicePluginConfigField,
} from '@fluxo/forge'

type AllocationAttr = { id: number; assigned: boolean }
type AllocationsResponse = {
    data?: Array<{ object?: string; attributes?: AllocationAttr }>
}

type NodeAttr = { id: number; location_id?: number }
type NodesResponse = {
    data?: Array<{ object?: string; attributes?: NodeAttr }>
}

type EggVarAttrs = { env_variable?: string; default_value?: string }
type EggVarItem = { attributes?: EggVarAttrs }

const MINECRAFT_EGG_ENV_DEFAULTS: Record<string, string> = {
    SERVER_JARFILE: 'server.jar',
    BUILD_NUMBER: 'latest',
}

function getCredentials(ctx: PluginContext): {
    baseUrl: string
    apiKey: string
} | null {
    const config = ctx.config as { baseUrl?: string; apiKey?: string }
    if (!config?.baseUrl || !config?.apiKey) return null
    return { baseUrl: config.baseUrl.replace(/\/$/, ''), apiKey: config.apiKey }
}

async function pterodactylRequest<T>(
    ctx: PluginContext,
    baseUrl: string,
    apiKey: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    data?: unknown
): Promise<T> {
    try {
        const response = await ctx.http.request<T>({
            method,
            url: `${baseUrl}/api/application/${endpoint}`,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            data,
            timeout: 15000,
        })
        return response.data
    } catch (err: unknown) {
        if (
            err &&
            typeof err === 'object' &&
            'response' in err &&
            (err as { response?: { data?: unknown; status?: number } }).response
        ) {
            const axiosErr = err as {
                response: { data?: unknown; status?: number }
            }
            const msg =
                typeof axiosErr.response.data === 'object' &&
                axiosErr.response.data !== null &&
                'errors' in axiosErr.response.data
                    ? JSON.stringify(
                          (axiosErr.response.data as { errors?: unknown })
                              .errors
                      )
                    : JSON.stringify(axiosErr.response.data)
            throw new Error(
                `Pterodactyl API ${axiosErr.response.status}: ${msg}`
            )
        }
        throw err
    }
}

async function getUnassignedAllocationId(
    ctx: PluginContext,
    baseUrl: string,
    apiKey: string,
    nodeId: number
): Promise<number> {
    const result = await pterodactylRequest<AllocationsResponse>(
        ctx,
        baseUrl,
        apiKey,
        `nodes/${nodeId}/allocations?per_page=100`
    )
    const list = result?.data ?? []
    const unassigned = list.find(
        (a) => a.attributes && a.attributes.assigned === false
    )
    if (!unassigned?.attributes?.id) {
        throw new Error(
            `Pterodactyl plugin: node ${nodeId} has no unassigned allocation. Create allocations in Panel (Nodes → node → Allocations).`
        )
    }
    return unassigned.attributes.id
}

function buildEggEnvironment(
    eggResponse: Record<string, unknown>
): Record<string, string> {
    const env: Record<string, string> = {}
    const root = (eggResponse?.data as Record<string, unknown>) ?? eggResponse
    const rel = (root?.relationships ?? eggResponse?.relationships) as
        | Record<string, unknown>
        | undefined

    let variablesData: Array<{ attributes?: EggVarAttrs }> | undefined
    if (rel) {
        const varsRel = rel.variables as
            | { data?: Array<EggVarItem> }
            | undefined
        if (Array.isArray(varsRel?.data)) {
            variablesData = varsRel.data
        } else {
            const configRel = rel.config as
                | {
                      relationships?: {
                          variables?: { data?: Array<EggVarItem> }
                      }
                  }
                | undefined
            variablesData = configRel?.relationships?.variables?.data
        }
    }

    if (Array.isArray(variablesData)) {
        for (const v of variablesData) {
            const attrs = v?.attributes
            if (attrs && typeof attrs.env_variable === 'string') {
                const val = attrs.default_value
                env[attrs.env_variable] =
                    typeof val === 'string'
                        ? val
                        : val != null
                          ? String(val)
                          : ''
            }
        }
    }

    for (const [key, defaultValue] of Object.entries(
        MINECRAFT_EGG_ENV_DEFAULTS
    )) {
        if (!(key in env) || env[key] === '') {
            env[key] = defaultValue
        }
    }
    return env
}

async function resolveNodeId(
    ctx: PluginContext,
    baseUrl: string,
    apiKey: string,
    locationId?: number,
    configNodeId?: number
): Promise<number> {
    if (configNodeId) return configNodeId
    if (!locationId) {
        throw new Error(
            'Pterodactyl plugin: provide either nodeId or locationId in product config'
        )
    }
    const result = await pterodactylRequest<NodesResponse>(
        ctx,
        baseUrl,
        apiKey,
        'nodes?per_page=100'
    )
    const list = result?.data ?? []
    const inLocation = list.find(
        (n) => n.attributes?.location_id === locationId
    )
    if (!inLocation?.attributes?.id) {
        throw new Error(
            `Pterodactyl plugin: no node found in location ${locationId}`
        )
    }
    return inLocation.attributes.id
}

export default class PterodactylPlugin extends FluxoServerPlugin {
    getSettingsSchema(): PluginSettingsField[] {
        return [
            {
                key: 'baseUrl',
                label: 'Panel URL',
                type: 'string',
                required: true,
                placeholder: 'https://panel.example.com',
            },
            {
                key: 'apiKey',
                label: 'Pterodactyl Admin API Key',
                type: 'string',
                required: true,
                secret: true,
            },
        ]
    }

    getConfigFields(): ServicePluginConfigField[] {
        return [
            {
                key: 'locationId',
                label: 'Location',
                type: 'select',
                required: false,
                dynamicOptions: true,
            },
            {
                key: 'nodeId',
                label: 'Node',
                type: 'select',
                required: false,
                dynamicOptions: true,
            },
            {
                key: 'nestId',
                label: 'Nest',
                type: 'select',
                required: true,
                dynamicOptions: true,
            },
            {
                key: 'eggId',
                label: 'Egg',
                type: 'select',
                required: true,
                dynamicOptions: true,
            },
            {
                key: 'memory',
                label: 'Memory (MB)',
                type: 'number',
                required: true,
                min: 0,
            },
            {
                key: 'swap',
                label: 'Swap (MB)',
                type: 'number',
                default: 0,
                min: 0,
            },
            {
                key: 'disk',
                label: 'Disk (MB)',
                type: 'number',
                required: true,
                min: 0,
            },
            { key: 'io', label: 'IO weight', type: 'number', default: 500 },
            { key: 'cpu', label: 'CPU limit (%)', type: 'number', default: 0 },
            {
                key: 'databases',
                label: 'Databases',
                type: 'number',
                default: 0,
                min: 0,
            },
            {
                key: 'backups',
                label: 'Backups',
                type: 'number',
                default: 0,
                min: 0,
            },
        ]
    }

    async getFieldOptions(
        fieldKey: string,
        context: Record<string, unknown>
    ): Promise<PluginFieldOption[]> {
        const creds = getCredentials(this.ctx)
        if (!creds) return []

        if (fieldKey === 'locationId') {
            const data = await pterodactylRequest<{
                data: Array<{ attributes: { id: number; short: string } }>
            }>(this.ctx, creds.baseUrl, creds.apiKey, 'locations')
            const list = data?.data ?? []
            return list.map((item) => ({
                value: item.attributes.id,
                label:
                    item.attributes.short || `Location ${item.attributes.id}`,
            }))
        }

        if (fieldKey === 'nodeId') {
            const data = await pterodactylRequest<{
                data: Array<{ attributes: { id: number; name: string } }>
            }>(this.ctx, creds.baseUrl, creds.apiKey, 'nodes')
            const list = data?.data ?? []
            return list.map((item) => ({
                value: item.attributes.id,
                label: item.attributes.name || `Node ${item.attributes.id}`,
            }))
        }

        if (fieldKey === 'nestId') {
            const data = await pterodactylRequest<{
                data: Array<{ attributes: { id: number; name: string } }>
            }>(this.ctx, creds.baseUrl, creds.apiKey, 'nests')
            const list = data?.data ?? []
            return list.map((item) => ({
                value: item.attributes.id,
                label: item.attributes.name || `Nest ${item.attributes.id}`,
            }))
        }

        if (fieldKey === 'eggId') {
            const nestId = context.nestId
            if (nestId == null) return []
            const data = await pterodactylRequest<{
                data: Array<{ attributes: { id: number; name: string } }>
            }>(this.ctx, creds.baseUrl, creds.apiKey, `nests/${nestId}/eggs`)
            const list = data?.data ?? []
            return list.map((item) => ({
                value: item.attributes.id,
                label: item.attributes.name || `Egg ${item.attributes.id}`,
            }))
        }

        return []
    }

    async getIssues(): Promise<PluginIssue[]> {
        const creds = getCredentials(this.ctx)
        if (!creds) {
            return [
                {
                    message: 'Plugin is not configured',
                    severity: 'error',
                    details:
                        'Set Panel URL and Admin API Key in the Options tab.',
                },
            ]
        }
        try {
            await pterodactylRequest(
                this.ctx,
                creds.baseUrl,
                creds.apiKey,
                'nodes'
            )
        } catch (err) {
            return [
                {
                    message: 'Cannot reach Pterodactyl Panel',
                    severity: 'error',
                    details: err instanceof Error ? err.message : String(err),
                },
            ]
        }
        return []
    }

    async provisionService(
        input: ProvisionServiceInput
    ): Promise<ProvisionServiceResult> {
        const creds = getCredentials(this.ctx)
        if (!creds) {
            throw new Error(
                'Pterodactyl plugin: configure baseUrl and apiKey in plugin config'
            )
        }

        const {
            nestId,
            eggId,
            memory,
            swap,
            disk,
            io,
            cpu,
            locationId,
            nodeId,
        } = input.pluginConfig as Record<string, number>
        if (!nestId || !eggId || memory == null || disk == null) {
            throw new Error(
                'Pterodactyl plugin: nestId, eggId, memory, disk are required'
            )
        }

        const eggs = await pterodactylRequest<{
            attributes: { docker_image: string; startup: string }
        }>(
            this.ctx,
            creds.baseUrl,
            creds.apiKey,
            `nests/${nestId}/eggs/${eggId}?include=variables`
        )
        const eggRaw = eggs as Record<string, unknown>
        const eggAttrs = (eggRaw?.attributes ?? {}) as Record<string, unknown>
        const dockerImage =
            (eggAttrs?.docker_image as string) ??
            'ghcr.io/pterodactyl/yolks:nodejs_18'
        const startup = (eggAttrs?.startup as string) ?? ''
        const environment = buildEggEnvironment(eggRaw)

        const userRow = await this.ctx.data.getUser(input.userId)
        const pterodactylUserId = userRow?.pterodactylId
        if (!pterodactylUserId) {
            throw new Error(
                'Pterodactyl plugin: user has no Pterodactyl ID; link the user in Panel first'
            )
        }
        const userId = parseInt(pterodactylUserId, 10)
        if (Number.isNaN(userId)) {
            throw new Error('Pterodactyl plugin: invalid Pterodactyl user ID')
        }

        const resolvedNodeId = await resolveNodeId(
            this.ctx,
            creds.baseUrl,
            creds.apiKey,
            locationId,
            nodeId
        )
        const allocationId = await getUnassignedAllocationId(
            this.ctx,
            creds.baseUrl,
            creds.apiKey,
            resolvedNodeId
        )

        const config = input.pluginConfig as Record<string, number>
        const serverPayload = {
            name: input.serviceName,
            user: userId,
            egg: eggId,
            docker_image: dockerImage,
            startup,
            environment,
            limits: {
                memory,
                swap: swap ?? 0,
                disk,
                io: io ?? 500,
                cpu: cpu ?? 0,
            },
            feature_limits: {
                databases: config.databases ?? 0,
                backups: config.backups ?? 0,
                allocations: config.allocations ?? 1,
            },
            allocation: { default: allocationId, additional: [] as number[] },
        }

        const created = await pterodactylRequest<{
            attributes: { id: number; identifier: string }
        }>(
            this.ctx,
            creds.baseUrl,
            creds.apiKey,
            'servers',
            'POST',
            serverPayload
        )
        const attrs = (
            created as { attributes?: { id?: number; identifier?: string } }
        )?.attributes
        const externalId = attrs?.identifier ?? String(attrs?.id ?? '')
        return { externalId }
    }
}
