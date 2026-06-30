import { z } from 'zod'

/**
 * Schema for creating a product. Only name, description and price are required.
 * RAM, storage and other specs can be 0 at creation and set on the edit page.
 */
export const createProductSchema = z.object({
    name: z
        .string()
        .min(3, 'Product name must be at least 3 characters')
        .max(100, 'Product name must be less than 100 characters'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be less than 500 characters'),
    price: z
        .number('Price must be a number')
        .positive('Price must be positive'),
    tags: z.array(z.string()).optional(),
    cpu: z.number().int().min(0).optional().default(0),
    ram: z
        .number()
        .int()
        .min(0, 'RAM must be 0 or greater')
        .optional()
        .default(0),
    storage: z
        .number()
        .int()
        .min(0, 'Storage must be 0 or greater')
        .optional()
        .default(0),
    ports: z.number().int().min(0).optional().default(0),
    databases: z.number().int().min(0).optional().default(0),
    backups: z.number().int().min(0).optional().default(0),
    hidden: z.boolean().optional(),
    disabled: z.boolean().optional(),
    allowCoupons: z.boolean().optional(),
    stockEnabled: z.boolean().optional(),
    stock: z
        .number()
        .int()
        .min(0, 'Stock must be 0 or greater')
        .nullable()
        .optional(),
    category: z.union([z.string(), z.number()]).nullable().optional(),
})

export type CreateProductFormData = z.infer<typeof createProductSchema>
