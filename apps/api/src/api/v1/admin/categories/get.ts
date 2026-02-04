import { Request, Response } from 'express'
import { getDb, categories } from '@fluxo/db'
import { eq, desc } from '@fluxo/db'
import { logger } from '../../../../utils/logger'

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const db = getDb()
        const categoriesList = await db
            .select()
            .from(categories)
            .orderBy(desc(categories.createdAt))

        const transformedCategories = categoriesList.map((c) => ({
            ...c,
            uuid: c.id.toString(),
            timestamps: {
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            },
        }))

        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            categories: transformedCategories,
        })
    } catch (error: unknown) {
        logger.error(`Error getting categories - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export const getCategoryById = async (req: Request, res: Response) => {
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

        const transformedCategory = {
            ...category,
            uuid: category.id.toString(),
            timestamps: {
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            },
        }

        res.status(200).json({
            success: true,
            message: 'Category fetched successfully',
            category: transformedCategory,
        })
    } catch (error: unknown) {
        logger.error(`Error getting category - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
