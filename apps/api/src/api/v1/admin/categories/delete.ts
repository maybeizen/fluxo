import { Request, Response } from 'express'
import { getDb, categories, products } from '@fluxo/db'
import { eq, sql } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { productCache } from '../../../../utils/cache'

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const categoryId = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID',
            })
        }
        const db = getDb()
        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, categoryId))
            .limit(1)

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            })
        }

        const productsWithCategoryResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(products)
            .where(eq(products.categoryId, categoryId))
        const productsWithCategory = Number(
            productsWithCategoryResult[0]?.count || 0
        )

        if (productsWithCategory > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${productsWithCategory} product(s) are using this category. Please reassign or remove products first.`,
            })
        }

        await db.delete(categories).where(eq(categories.id, categoryId))

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error deleting category - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
