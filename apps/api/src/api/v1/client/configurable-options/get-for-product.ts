import { type Request, type Response } from 'express'
import {
    getDb,
    configurableOptions,
    configurableOptionScopes,
    configurableOptionPricing,
    inArray,
    or,
    eq,
    isNull,
} from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { getPluginManager } from '../../../../plugins/manager'
import { getPluginConfigField } from '../../../../utils/configurable-options'

export const getConfigurableOptionsForProduct = async (
    req: Request,
    res: Response
) => {
    try {
        const productId = parseInt(req.query.productId as string, 10)
        if (isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid productId is required',
            })
        }

        const db = getDb()

        const scopesForProduct = await db
            .select()
            .from(configurableOptionScopes)
            .where(
                or(
                    eq(configurableOptionScopes.productId, productId),
                    isNull(configurableOptionScopes.productId)
                )!
            )
        const optionIds = [...new Set(scopesForProduct.map((s) => s.optionId))]

        if (optionIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Configurable options fetched successfully',
                configurableOptions: [],
            })
        }

        const options = await db
            .select()
            .from(configurableOptions)
            .where(inArray(configurableOptions.id, optionIds))

        const scopes = await db
            .select()
            .from(configurableOptionScopes)
            .where(inArray(configurableOptionScopes.optionId, optionIds))

        const pricingList = await db
            .select()
            .from(configurableOptionPricing)
            .where(inArray(configurableOptionPricing.optionId, optionIds))

        const registry = getPluginManager()
        const scopesByOption = new Map<number, typeof scopes>()
        for (const s of scopes) {
            if (!scopesByOption.has(s.optionId))
                scopesByOption.set(s.optionId, [])
            scopesByOption.get(s.optionId)!.push(s)
        }
        const pricingByOption = new Map(pricingList.map((p) => [p.optionId, p]))

        const configurableOptionsList = await Promise.all(
            options.map(async (opt) => {
                const field = await getPluginConfigField(
                    opt.pluginId,
                    opt.fieldKey,
                    (id) => registry.getService(id)
                )
                const optionType = opt.type as string | null | undefined
                const schemaType: 'number' | 'string' | 'boolean' | 'select' =
                    optionType === 'checkbox'
                        ? 'boolean'
                        : optionType === 'text'
                          ? 'string'
                          : optionType === 'number' || optionType === 'select'
                            ? (optionType as 'number' | 'select')
                            : ((field?.type as
                                  | 'number'
                                  | 'string'
                                  | 'boolean'
                                  | 'select') ?? 'string')
                const schema = {
                    type: schemaType,
                    label: field?.label ?? opt.label ?? opt.fieldKey ?? '',
                    required: field?.required ?? false,
                    default: opt.defaultValue ?? field?.default,
                    options: field?.options,
                    min: field?.min,
                    max: field?.max,
                }
                return {
                    id: opt.id,
                    pluginId: opt.pluginId,
                    fieldKey: opt.fieldKey,
                    label: opt.label ?? opt.fieldKey,
                    defaultValue: opt.defaultValue,
                    order: opt.order,
                    scopes: scopesByOption.get(opt.id) ?? [],
                    pricing: pricingByOption.get(opt.id) ?? null,
                    schema,
                }
            })
        )

        configurableOptionsList.sort((a, b) => a.order - b.order)

        res.status(200).json({
            success: true,
            message: 'Configurable options fetched successfully',
            configurableOptions: configurableOptionsList,
        })
    } catch (error: unknown) {
        logger.error(
            `Error getting configurable options for product - ${error}`
        )
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
