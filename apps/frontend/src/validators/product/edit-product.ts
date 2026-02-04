import { z } from 'zod'

export const editProductSchema = z.object({
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
    cpu: z
        .number('CPU must be a number')
        .int('CPU must be an integer')
        .min(0, 'CPU must be 0 or greater'),
    ram: z
        .number('RAM must be a number')
        .int('RAM must be an integer')
        .min(0, 'RAM must be 0 or greater'),
    storage: z
        .number('Storage must be a number')
        .int('Storage must be an integer')
        .min(0, 'Storage must be 0 or greater'),
    ports: z
        .number('Ports must be a number')
        .int('Ports must be an integer')
        .min(0, 'Ports must be 0 or greater'),
    databases: z
        .number('Databases must be a number')
        .int('Databases must be an integer')
        .min(0, 'Databases must be 0 or greater'),
    backups: z
        .number('Backups must be a number')
        .int('Backups must be an integer')
        .min(0, 'Backups must be 0 or greater'),
    hidden: z.boolean().optional(),
    disabled: z.boolean().optional(),
    allowCoupons: z.boolean().optional(),
    stockEnabled: z.boolean().optional(),
    stock: z
        .number('Stock must be a number')
        .int('Stock must be an integer')
        .min(0, 'Stock must be 0 or greater')
        .nullable()
        .optional(),
    category: z.union([z.string(), z.number()]).nullable().optional(),
})

export type EditProductFormData = z.infer<typeof editProductSchema>
