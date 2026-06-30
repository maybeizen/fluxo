import { z } from 'zod'

export const createProductSchema = z.object({
    metadata: z.object({
        name: z
            .string()
            .min(3, 'Product name must be at least 3 characters')
            .max(100, 'Product name must be less than 100 characters'),
        description: z
            .string()
            .min(10, 'Description must be at least 10 characters')
            .max(500, 'Description must be less than 500 characters'),
        price: z.number().positive('Price must be positive'),
        tags: z.array(z.string()).optional().default([]),
    }),
    specifications: z.object({
        cpu: z.number().int().min(0, 'CPU must be 0 or greater'),
        ram: z.number().int().min(0, 'RAM must be 0 or greater'),
        storage: z.number().int().min(0, 'Storage must be 0 or greater'),
        ports: z.number().int().min(0, 'Ports must be 0 or greater'),
        databases: z.number().int().min(0, 'Databases must be 0 or greater'),
        backups: z.number().int().min(0, 'Backups must be 0 or greater'),
    }),
    status: z
        .object({
            hidden: z.boolean().optional().default(false),
            disabled: z.boolean().optional().default(false),
            allowCoupons: z.boolean().optional().default(true),
        })
        .optional()
        .default({ hidden: false, disabled: false, allowCoupons: true }),
    stock: z
        .object({
            stockEnabled: z.boolean().optional().default(false),
            stock: z
                .number()
                .int()
                .min(0, 'Stock must be 0 or greater')
                .nullable()
                .optional()
                .default(null),
        })
        .optional()
        .default({ stockEnabled: false, stock: null }),
    category: z.coerce.number().nullable().optional(),
    order: z
        .number()
        .int()
        .min(0, 'Order must be 0 or greater')
        .optional()
        .default(0),
    integrations: z
        .object({
            servicePluginId: z.string().min(1).optional(),
            servicePluginConfig: z.record(z.string(), z.unknown()).optional(),
        })
        .optional(),
})

export type CreateProductSchema = z.infer<typeof createProductSchema>
