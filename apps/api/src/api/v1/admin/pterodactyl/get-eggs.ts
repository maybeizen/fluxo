import { Request, Response } from 'express'
import { logger } from '../../../../utils/logger'
import { pterodactylApiRequest } from '../../../../utils/pterodactyl'
import { pterodactylCache } from '../../../../utils/cache'

export const getEggs = async (req: Request, res: Response) => {
    try {
        const nestId = req.query.nestId as string

        if (!nestId) {
            return res.status(400).json({
                success: false,
                message: 'nestId query parameter is required',
            })
        }

        const cacheKey = `eggs:${nestId}`
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
        }>(`nests/${nestId}/eggs`)

        if (data && 'data' in data && Array.isArray(data.data)) {
            const eggs = data.data.map((item) => item.attributes)
            await pterodactylCache.set(cacheKey, eggs, 300)
            res.status(200).json({
                success: true,
                data: eggs,
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
        logger.error(`Error fetching Pterodactyl eggs - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch eggs from Pterodactyl API',
        })
    }
}
