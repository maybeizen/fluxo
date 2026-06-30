import { type Request, type Response } from 'express'
import { getDb, configurableOptions, eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { configurableOptionsCache } from '../../../../utils/cache'

export const deleteConfigurableOption = async (req: Request, res: Response) => {
    try {
        const id = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid option ID',
            })
        }

        const db = getDb()
        const [option] = await db
            .select()
            .from(configurableOptions)
            .where(eq(configurableOptions.id, id))
            .limit(1)

        if (!option) {
            return res.status(404).json({
                success: false,
                message: 'Configurable option not found',
            })
        }

        await db
            .delete(configurableOptions)
            .where(eq(configurableOptions.id, id))

        await configurableOptionsCache.delPattern('list:*')
        await configurableOptionsCache.del(`id:${id}`)

        res.status(200).json({
            success: true,
            message: 'Configurable option deleted successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error deleting configurable option - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
