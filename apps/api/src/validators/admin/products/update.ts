import { z } from 'zod'

export const updateProductSchema = z.object({
    metadata: z
        .object({
            name: z
                .string()
                .min(3, 'Product name must be at least 3 characters')
                .max(100, 'Product name must be less than 100 characters')
                .optional(),
            description: z
                .string()
                .min(10, 'Description must be at least 10 characters')
                .max(500, 'Description must be less than 500 characters')
                .optional(),
            price: z.number().positive('Price must be positive').optional(),
            tags: z.array(z.string()).optional(),
        })
        .optional(),
    specifications: z
        .object({
            cpu: z.number().int().min(0, 'CPU must be 0 or greater').optional(),
            ram: z.number().int().min(0, 'RAM must be 0 or greater').optional(),
            storage: z
                .number()
                .int()
                .min(0, 'Storage must be 0 or greater')
                .optional(),
            ports: z
                .number()
                .int()
                .min(0, 'Ports must be 0 or greater')
                .optional(),
            databases: z
                .number()
                .int()
                .min(0, 'Databases must be 0 or greater')
                .optional(),
            backups: z
                .number()
                .int()
                .min(0, 'Backups must be 0 or greater')
                .optional(),
        })
        .optional(),
    status: z
        .object({
            hidden: z.boolean().optional(),
            disabled: z.boolean().optional(),
            allowCoupons: z.boolean().optional(),
        })
        .optional(),
    stock: z
        .object({
            stockEnabled: z.boolean().optional(),
            stock: z
                .number()
                .int()
                .min(0, 'Stock must be 0 or greater')
                .nullable()
                .optional(),
        })
        .optional(),
    category: z.coerce
        .number()
        .int()
        .positive('Invalid category ID')
        .nullable()
        .optional(),
    order: z.number().int().min(0, 'Order must be 0 or greater').optional(),
    integrations: z
        .object({
            pterodactyl: z
                .object({
                    enabled: z.boolean().optional(),
                    locationId: z.number().int().positive().optional(),
                    nodeId: z.number().int().positive().optional(),
                    nestId: z.number().int().positive().optional(),
                    eggId: z.number().int().positive().optional(),
                    memory: z.number().int().min(0).optional(),
                    swap: z.number().int().min(0).optional(),
                    disk: z.number().int().min(0).optional(),
                    io: z.number().int().min(0).optional(),
                    cpu: z.number().int().min(0).max(100).optional(),
                    cpuPinning: z.string().optional(),
                    databases: z.number().int().min(0).optional(),
                    backups: z.number().int().min(0).optional(),
                    additionalAllocations: z.number().int().min(0).optional(),
                    oomKiller: z.boolean().optional(),
                    skipEggInstallScript: z.boolean().optional(),
                    startOnCompletion: z.boolean().optional(),
                })
                .optional(),
            servicePluginId: z.string().min(1).nullable().optional(),
            servicePluginConfig: z
                .record(z.string(), z.unknown())
                .nullable()
                .optional(),
        })
        .optional(),
})

export type UpdateProductSchema = z.infer<typeof updateProductSchema>
