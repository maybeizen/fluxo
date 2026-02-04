import { Request, Response } from 'express'
import { getDb, products } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { productCache } from '../../../../utils/cache'
import { z } from 'zod'

const reorderProductsSchema = z.object({
    products: z.array(
        z.object({
            id: z.coerce.number(),
            order: z.number().int().min(0),
        })
    ),
})

export const reorderProducts = async (req: Request, res: Response) => {
    try {
        const validated = await reorderProductsSchema.parseAsync(req.body)

        const db = getDb()

        await Promise.all(
            validated.products.map((item) =>
                db
                    .update(products)
                    .set({ order: item.order, updatedAt: new Date() })
                    .where(eq(products.id, item.id))
            )
        )

        await productCache.delPattern('list:*')

        res.status(200).json({
            success: true,
            message: 'Products reordered successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error reordering products - ${error}`)

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
