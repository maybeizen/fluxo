import { z } from 'zod'
import { getPluginManager } from '../../../plugins/manager'
import {
    getPluginConfigField,
    zodSchemaForConfigField,
} from '../../../utils/configurable-options'

const pricingTypeEnum = ['one_time', 'recurring', 'billing_cycle'] as const
const inputTypeEnum = ['text', 'number', 'checkbox', 'select'] as const

const scopeSchema = z.object({
    productId: z.coerce.number().nullable(),
    defaultValue: z.unknown().optional(),
})

const pricingSchema = z.object({
    pricingType: z.enum(pricingTypeEnum),
    amount: z.number().int().min(0),
    useMultiplier: z.boolean().default(false),
})

export const createConfigurableOptionSchema = z
    .object({
        pluginId: z.string().min(1, 'Plugin is required').max(64),
        fieldKey: z.string().min(1, 'Field key is required').max(255),
        label: z.string().max(255).optional(),
        type: z.enum(inputTypeEnum).optional().nullable(),
        defaultValue: z.unknown().optional(),
        order: z.coerce.number().int().min(0).default(0),
        scopes: z.array(scopeSchema).default([]),
        pricing: pricingSchema.optional(),
    })
    .superRefine(async (data, ctx) => {
        const registry = getPluginManager()
        const plugin = await registry.getService(data.pluginId)
        if (!plugin) {
            ctx.addIssue({
                code: 'custom',
                path: ['pluginId'],
                message: 'Plugin not found or is not a service plugin',
            })
            return
        }
        const configFields = plugin.getConfigFields?.() ?? []
        if (configFields.length === 0) {
            ctx.addIssue({
                code: 'custom',
                path: ['pluginId'],
                message: 'Plugin has no config fields',
            })
            return
        }
        const field = await getPluginConfigField(
            data.pluginId,
            data.fieldKey,
            (id) => registry.getService(id)
        )
        if (!field) {
            ctx.addIssue({
                code: 'custom',
                path: ['fieldKey'],
                message: `Field "${data.fieldKey}" not found in plugin config fields`,
            })
            return
        }
        const valueSchema = zodSchemaForConfigField(field)
        if (data.defaultValue !== undefined && data.defaultValue !== null) {
            const result = valueSchema.safeParse(data.defaultValue)
            if (!result.success) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['defaultValue'],
                    message:
                        result.error.issues[0]?.message ??
                        'Invalid default value',
                })
            }
        }
        for (let i = 0; i < data.scopes.length; i++) {
            const scope = data.scopes[i]
            if (
                scope.defaultValue !== undefined &&
                scope.defaultValue !== null
            ) {
                const result = valueSchema.safeParse(scope.defaultValue)
                if (!result.success) {
                    ctx.addIssue({
                        code: 'custom',
                        path: ['scopes', i, 'defaultValue'],
                        message:
                            result.error.issues[0]?.message ??
                            'Invalid scope default value',
                    })
                }
            }
        }
    })

export type CreateConfigurableOptionSchema = z.infer<
    typeof createConfigurableOptionSchema
>
