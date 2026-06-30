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

export const updateConfigurableOptionSchema = z
    .object({
        pluginId: z.string().min(1).max(64).optional(),
        fieldKey: z.string().min(1).max(255).optional(),
        label: z.string().max(255).optional().nullable(),
        type: z.enum(inputTypeEnum).optional().nullable(),
        defaultValue: z.unknown().optional(),
        order: z.coerce.number().int().min(0).optional(),
        scopes: z.array(scopeSchema).optional(),
        pricing: pricingSchema.optional().nullable(),
    })
    .superRefine(async (data, ctx) => {
        const pluginId = data.pluginId
        const fieldKey = data.fieldKey
        if (!pluginId || !fieldKey) return
        const registry = getPluginManager()
        const plugin = await registry.getService(pluginId)
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
        const field = await getPluginConfigField(pluginId, fieldKey, (id) =>
            registry.getService(id)
        )
        if (!field) {
            ctx.addIssue({
                code: 'custom',
                path: ['fieldKey'],
                message: `Field "${fieldKey}" not found in plugin config fields`,
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
        if (data.scopes) {
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
        }
    })

export type UpdateConfigurableOptionSchema = z.infer<
    typeof updateConfigurableOptionSchema
>
