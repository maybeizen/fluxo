import { Request, Response } from 'express'
import { logger } from '../../../../utils/logger'
import { pterodactylApiRequest } from '../../../../utils/pterodactyl'
import { pterodactylCache } from '../../../../utils/cache'

export const refreshPterodactylData = async (req: Request, res: Response) => {
    try {
        await pterodactylCache.del('nodes')
        await pterodactylCache.del('users')
        await pterodactylCache.del('servers')

        const [nodesData, usersData, serversData] = await Promise.allSettled([
            pterodactylApiRequest<{
                data: Array<{ object: string; attributes: unknown }>
            }>('nodes'),
            pterodactylApiRequest<{
                data: Array<{ object: string; attributes: unknown }>
            }>('users'),
            pterodactylApiRequest<{
                data: Array<{ object: string; attributes: unknown }>
            }>('servers'),
        ])

        const results: {
            nodes: { success: boolean; data: unknown[]; error?: string }
            users: { success: boolean; data: unknown[]; error?: string }
            servers: { success: boolean; data: unknown[]; error?: string }
        } = {
            nodes: { success: false, data: [] },
            users: { success: false, data: [] },
            servers: { success: false, data: [] },
        }

        if (
            nodesData.status === 'fulfilled' &&
            nodesData.value &&
            'data' in nodesData.value &&
            Array.isArray(nodesData.value.data)
        ) {
            const nodes = nodesData.value.data.map((item) => item.attributes)
            results.nodes = { success: true, data: nodes }
            await pterodactylCache.set('nodes', nodes, 300)
        } else {
            results.nodes.error =
                nodesData.status === 'rejected'
                    ? nodesData.reason?.message
                    : 'Unknown error'
        }

        if (
            usersData.status === 'fulfilled' &&
            usersData.value &&
            'data' in usersData.value &&
            Array.isArray(usersData.value.data)
        ) {
            const users = usersData.value.data.map((item) => item.attributes)
            results.users = { success: true, data: users }
            await pterodactylCache.set('users', users, 300)
        } else {
            results.users.error =
                usersData.status === 'rejected'
                    ? usersData.reason?.message
                    : 'Unknown error'
        }

        if (
            serversData.status === 'fulfilled' &&
            serversData.value &&
            'data' in serversData.value &&
            Array.isArray(serversData.value.data)
        ) {
            const servers = serversData.value.data.map(
                (item) => item.attributes
            )
            results.servers = { success: true, data: servers }
            await pterodactylCache.set('servers', servers, 300)
        } else {
            results.servers.error =
                serversData.status === 'rejected'
                    ? serversData.reason?.message
                    : 'Unknown error'
        }

        res.status(200).json({
            success: true,
            message: 'Pterodactyl data refreshed',
            results,
        })
    } catch (error: unknown) {
        logger.error(`Error refreshing Pterodactyl data - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Failed to refresh Pterodactyl data',
        })
    }
}
