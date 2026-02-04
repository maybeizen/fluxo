import { Request, Response } from 'express'
import { getDb, products } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { productCache } from '../../../../utils/cache'

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const productId = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID',
            })
        }
        const db = getDb()

        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            })
        }

        await db.delete(products).where(eq(products.id, productId))

        await productCache.delPattern('list:*')
        await productCache.del(`id:${productId}`)

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error deleting product - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
