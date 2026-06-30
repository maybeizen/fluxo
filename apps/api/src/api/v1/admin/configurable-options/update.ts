import { type Request, type Response } from 'express'
import { updateConfigurableOptionSchema } from '../../../../validators/admin/configurable-options/update'
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

export const updateConfigurableOption = async (req: Request, res: Response) => {
    try {
        const id = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid option ID',
            })
        }

        const db = getDb()
        const [existing] = await db
            .select()
            .from(configurableOptions)
            .where(eq(configurableOptions.id, id))
            .limit(1)

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Configurable option not found',
            })
        }

        const validated = await updateConfigurableOptionSchema.parseAsync(
            req.body
        )

        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        }
        if (validated.pluginId !== undefined)
            updateData.pluginId = validated.pluginId
        if (validated.fieldKey !== undefined)
            updateData.fieldKey = validated.fieldKey
        if (validated.label !== undefined) updateData.label = validated.label
        if (validated.type !== undefined) updateData.type = validated.type
        if (validated.defaultValue !== undefined)
            updateData.defaultValue = validated.defaultValue
        if (validated.order !== undefined) updateData.order = validated.order

        await db
            .update(configurableOptions)
            .set(updateData as Record<string, unknown>)
            .where(eq(configurableOptions.id, id))

        if (validated.scopes !== undefined) {
            await db
                .delete(configurableOptionScopes)
                .where(eq(configurableOptionScopes.optionId, id))
            if (validated.scopes.length > 0) {
                await db.insert(configurableOptionScopes).values(
                    validated.scopes.map((s) => ({
                        optionId: id,
                        productId: s.productId,
                        defaultValue:
                            s.defaultValue !== undefined &&
                            s.defaultValue !== null
                                ? s.defaultValue
                                : null,
                    }))
                )
            }
        }

        if (validated.pricing !== undefined) {
            if (validated.pricing === null) {
                await db
                    .delete(configurableOptionPricing)
                    .where(eq(configurableOptionPricing.optionId, id))
            } else {
                const [existingPricing] = await db
                    .select()
                    .from(configurableOptionPricing)
                    .where(eq(configurableOptionPricing.optionId, id))
                    .limit(1)
                if (existingPricing) {
                    await db
                        .update(configurableOptionPricing)
                        .set({
                            pricingType: validated.pricing.pricingType as
                                | 'one_time'
                                | 'recurring'
                                | 'billing_cycle',
                            amount: validated.pricing.amount,
                            useValueAsMultiplier:
                                validated.pricing.useMultiplier ?? false,
                            updatedAt: new Date(),
                        })
                        .where(eq(configurableOptionPricing.optionId, id))
                } else {
                    await db.insert(configurableOptionPricing).values({
                        optionId: id,
                        pricingType: validated.pricing.pricingType as
                            | 'one_time'
                            | 'recurring'
                            | 'billing_cycle',
                        amount: validated.pricing.amount,
                        useValueAsMultiplier:
                            validated.pricing.useMultiplier ?? false,
                    })
                }
            }
        }

        await configurableOptionsCache.delPattern('list:*')
        await configurableOptionsCache.del(`id:${id}`)

        const [updated] = await db
            .select()
            .from(configurableOptions)
            .where(eq(configurableOptions.id, id))
            .limit(1)
        const scopes = await db
            .select()
            .from(configurableOptionScopes)
            .where(eq(configurableOptionScopes.optionId, id))
        const [pricing] = await db
            .select()
            .from(configurableOptionPricing)
            .where(eq(configurableOptionPricing.optionId, id))
            .limit(1)

        res.status(200).json({
            success: true,
            message: 'Configurable option updated successfully',
            configurableOption: {
                ...updated,
                scopes,
                pricing: pricing ?? null,
            },
        })
    } catch (error: unknown) {
        logger.error(`Error updating configurable option - ${error}`)

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
