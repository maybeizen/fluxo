import { Request, Response } from 'express'
import { updateCategorySchema } from '../../../../validators/admin/categories/update'
import { ZodError } from 'zod'
import { getDb, categories } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'

export const updateCategory = async (req: Request, res: Response) => {
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

        const validated = await updateCategorySchema.parseAsync(req.body)

        const updateData: any = { updatedAt: new Date() }
        if (validated.name !== undefined) {
            updateData.name = validated.name
        }
        if (validated.description !== undefined) {
            updateData.description = validated.description ?? null
        }

        await db
            .update(categories)
            .set(updateData)
            .where(eq(categories.id, categoryId))

        const [updatedCategory] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, categoryId))
            .limit(1)

        const transformedCategory = {
            ...updatedCategory,
            uuid: updatedCategory.id.toString(),
            timestamps: {
                createdAt: updatedCategory.createdAt,
                updatedAt: updatedCategory.updatedAt,
            },
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            category: transformedCategory,
        })
    } catch (error: unknown) {
        logger.error(`Error updating category - ${error}`)

        if (error instanceof ZodError) {
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
