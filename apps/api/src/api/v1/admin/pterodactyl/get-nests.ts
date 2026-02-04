import { Request, Response } from 'express'
import { logger } from '../../../../utils/logger'
import { pterodactylApiRequest } from '../../../../utils/pterodactyl'
import { pterodactylCache } from '../../../../utils/cache'

export const getNests = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'nests'
        const cached = await pterodactylCache.get(cacheKey)

        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached,
                cached: true,
            })
        }

        const data = await pterodactylApiRequest<{
            data: Array<{ object: string; attributes: unknown }>
        }>('nests')

        if (data && 'data' in data && Array.isArray(data.data)) {
            const nests = data.data.map((item) => item.attributes)
            await pterodactylCache.set(cacheKey, nests, 300)
            res.status(200).json({
                success: true,
                data: nests,
                cached: false,
            })
        } else {
            res.status(200).json({
                success: true,
                data: [],
                cached: false,
            })
        }
    } catch (error: unknown) {
        logger.error(`Error fetching Pterodactyl nests - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nests from Pterodactyl API',
        })
    }
}
