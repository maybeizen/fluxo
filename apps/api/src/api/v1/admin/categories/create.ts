import { Request, Response } from 'express'
import { createCategorySchema } from '../../../../validators/admin/categories/create'
import { ZodError } from 'zod'
import { getDb, categories } from '@fluxo/db'
import { logger } from '../../../../utils/logger'

export const createCategory = async (req: Request, res: Response) => {
    try {
        const validated = await createCategorySchema.parseAsync(req.body)

        const db = getDb()
        const [newCategory] = await db
            .insert(categories)
            .values({
                name: validated.name,
                description: validated.description,
            })
            .returning()

        const transformedCategory = {
            ...newCategory,
            uuid: newCategory.id.toString(),
            timestamps: {
                createdAt: newCategory.createdAt,
                updatedAt: newCategory.updatedAt,
            },
        }

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category: transformedCategory,
        })
    } catch (error: unknown) {
        logger.error(`Error creating category - ${error}`)

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
