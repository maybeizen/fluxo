import { type Request, type Response } from 'express'
import { createConfigurableOptionSchema } from '../../../../validators/admin/configurable-options/create'
import { ZodError } from 'zod'
import {
    getDb,
    eq,
    configurableOptions,
    configurableOptionScopes,
    configurableOptionPricing,
} from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { configurableOptionsCache } from '../../../../utils/cache'
import { formatZodErrors } from '../../../../utils/zod-errors'

export const createConfigurableOption = async (req: Request, res: Response) => {
    try {
        const validated = await createConfigurableOptionSchema.parseAsync(
            req.body
        )

        const db = getDb()

        const [option] = await db
            .insert(configurableOptions)
            .values({
                pluginId: validated.pluginId,
                fieldKey: validated.fieldKey,
                label: validated.label ?? null,
                type: validated.type ?? null,
                defaultValue:
                    validated.defaultValue !== undefined &&
                    validated.defaultValue !== null
                        ? validated.defaultValue
                        : null,
                order: validated.order,
            })
            .returning()

        if (validated.scopes.length > 0) {
            await db.insert(configurableOptionScopes).values(
                validated.scopes.map((s) => ({
                    optionId: option.id,
                    productId: s.productId,
                    defaultValue:
                        s.defaultValue !== undefined && s.defaultValue !== null
                            ? s.defaultValue
                            : null,
                }))
            )
        }

        if (validated.pricing) {
            await db.insert(configurableOptionPricing).values({
                optionId: option.id,
                pricingType: validated.pricing.pricingType as
                    'one_time' | 'recurring' | 'billing_cycle',
                amount: validated.pricing.amount,
                useValueAsMultiplier: validated.pricing.useMultiplier ?? false,
            })
        }

        await configurableOptionsCache.delPattern('list:*')

        const scopes = await db
            .select()
            .from(configurableOptionScopes)
            .where(eq(configurableOptionScopes.optionId, option.id))
        const [pricing] = validated.pricing
            ? await db
                  .select()
                  .from(configurableOptionPricing)
                  .where(eq(configurableOptionPricing.optionId, option.id))
                  .limit(1)
            : [null]

        const configurableOption = {
            ...option,
            scopes,
            pricing: pricing ?? null,
        }

        res.status(201).json({
            success: true,
            message: 'Configurable option created successfully',
            configurableOption,
        })
    } catch (error: unknown) {
        logger.error(`Error creating configurable option - ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: formatZodErrors(error),
            })
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
