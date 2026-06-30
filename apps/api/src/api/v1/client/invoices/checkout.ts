import { type Request, type Response } from 'express'
import { checkoutInvoiceSchema } from '../../../../validators/client/invoices/checkout'
import { ZodError } from 'zod'
import {
    getDb,
    invoices,
    invoiceItems,
    products,
    configurableOptions,
    configurableOptionScopes,
    configurableOptionPricing,
    userConfigSelections,
    eq,
    or,
    inArray,
    isNull,
} from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { invoiceCache } from '../../../../utils/cache'
import { InvoiceStatus, PaymentProvider } from '@fluxo/types'
import { getPluginManager } from '../../../../plugins/manager'
import { processPaymentWithGateway } from '../../../../plugins/hooks/payment'
import {
    resolveConfigurableOptions,
    getPluginConfigField,
    zodSchemaForConfigField,
} from '../../../../utils/configurable-options'
import { serializeInvoiceMetadata } from '../../../../utils/invoice-metadata'

export const createInvoiceFromCheckout = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId
        const validated = await checkoutInvoiceSchema.parseAsync(req.body)
        const db = getDb()

        let itemsToInsert: {
            name: string
            quantity: number
            unitPrice: number
            total: number
        }[] = []
        let amountInCents = 0

        if (validated.productId != null) {
            const productId = validated.productId
            const [product] = await db
                .select()
                .from(products)
                .where(eq(products.id, productId))
                .limit(1)

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: 'Product not found',
                })
            }
            if (product.hidden || product.disabled) {
                return res.status(400).json({
                    success: false,
                    message: 'Product is not available for purchase',
                })
            }

            const productPriceCents = Math.round(product.price)
            itemsToInsert = [
                {
                    name: product.name,
                    quantity: 1,
                    unitPrice: productPriceCents,
                    total: productPriceCents,
                },
            ]
            amountInCents = productPriceCents

            if (
                validated.configurableSelections &&
                Object.keys(validated.configurableSelections).length > 0
            ) {
                const scopesForProduct = await db
                    .select()
                    .from(configurableOptionScopes)
                    .where(
                        or(
                            eq(configurableOptionScopes.productId, productId),
                            isNull(configurableOptionScopes.productId)
                        )!
                    )
                const optionIds = [
                    ...new Set(scopesForProduct.map((s) => s.optionId)),
                ]
                if (optionIds.length > 0) {
                    const options = await db
                        .select()
                        .from(configurableOptions)
                        .where(inArray(configurableOptions.id, optionIds))
                    const scopes = await db
                        .select()
                        .from(configurableOptionScopes)
                        .where(
                            inArray(
                                configurableOptionScopes.optionId,
                                optionIds
                            )
                        )
                    const pricingList = await db
                        .select()
                        .from(configurableOptionPricing)
                        .where(
                            inArray(
                                configurableOptionPricing.optionId,
                                optionIds
                            )
                        )
                    const registry = getPluginManager()
                    const scopesByOption = new Map<number, typeof scopes>()
                    for (const s of scopes) {
                        if (!scopesByOption.has(s.optionId))
                            scopesByOption.set(s.optionId, [])
                        scopesByOption.get(s.optionId)!.push(s)
                    }
                    const pricingByOption = new Map(
                        pricingList.map((p) => [p.optionId, p])
                    )
                    const optionsWithScopes = options.map((opt) => ({
                        ...opt,
                        scopes: scopesByOption.get(opt.id) ?? [],
                        pricing: pricingByOption.get(opt.id) ?? null,
                    }))

                    for (const [optionIdStr, value] of Object.entries(
                        validated.configurableSelections
                    )) {
                        const optionId = parseInt(optionIdStr, 10)
                        const opt = optionsWithScopes.find(
                            (o) => o.id === optionId
                        )
                        if (!opt) {
                            return res.status(400).json({
                                success: false,
                                message: `Invalid configurable option: ${optionId}`,
                            })
                        }
                        const field = await getPluginConfigField(
                            opt.pluginId,
                            opt.fieldKey,
                            (id) => registry.getService(id)
                        )
                        if (field) {
                            const schema = zodSchemaForConfigField(field)
                            const result = schema.safeParse(value)
                            if (!result.success) {
                                return res.status(400).json({
                                    success: false,
                                    errors: [
                                        {
                                            field: `configurableSelections.${optionId}`,
                                            message:
                                                result.error.issues[0]
                                                    ?.message ??
                                                'Invalid value',
                                        },
                                    ],
                                })
                            }
                        }
                    }

                    const { lineItems: optionLineItems } =
                        resolveConfigurableOptions(
                            productId,
                            optionsWithScopes,
                            validated.configurableSelections
                        )
                    for (const li of optionLineItems) {
                        if (li.pricing) {
                            const totalCents = li.pricing.amountCents
                            itemsToInsert.push({
                                name: li.label,
                                quantity: 1,
                                unitPrice: totalCents,
                                total: totalCents,
                            })
                            amountInCents += totalCents
                        }
                    }
                }
            }

            const clientAmountCents = Math.round(validated.amount * 100)
            if (clientAmountCents !== amountInCents) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Price mismatch — total does not match server price',
                })
            }
        } else {
            itemsToInsert = validated.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                unitPrice: Math.round(item.unitPrice * 100),
                total: Math.round(item.total * 100),
            }))
            amountInCents = Math.round(validated.amount * 100)

            const computedTotal = itemsToInsert.reduce(
                (sum, item) => sum + item.total,
                0
            )
            if (computedTotal !== amountInCents) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Price mismatch — items total does not match amount',
                })
            }
        }

        let paymentProviderKey: string | undefined
        if (validated.gatewayPluginId) {
            const registry = getPluginManager()
            const gateway = await registry.getGateway(validated.gatewayPluginId)
            if (gateway) {
                paymentProviderKey = gateway.getPaymentProviderKey()
            }
        }

        const insertValues = {
            userId,
            serviceId: validated.serviceId ?? null,
            transactionId: validated.transactionId ?? null,
            status: InvoiceStatus.PENDING as const,
            amount: amountInCents,
            currency: validated.currency,
            metadata: serializeInvoiceMetadata(validated.metadata),
            expiresAt: validated.expiresAt,
            gatewayPluginId: validated.gatewayPluginId ?? null,
            paymentProviderKey: paymentProviderKey ?? null,
            paymentProvider: validated.gatewayPluginId
                ? null
                : ((validated.paymentProvider as PaymentProvider) ??
                  PaymentProvider.STRIPE),
        }

        const [newInvoice] = await db
            .insert(invoices)
            .values(insertValues)
            .returning()

        await db.insert(invoiceItems).values(
            itemsToInsert.map((item) => ({
                invoiceId: newInvoice.id,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
            }))
        )

        if (
            validated.configurableSelections &&
            Object.keys(validated.configurableSelections).length > 0
        ) {
            await db.insert(userConfigSelections).values(
                Object.entries(validated.configurableSelections).map(
                    ([optionId, value]) => ({
                        userId,
                        optionId: parseInt(optionId, 10),
                        value,
                        invoiceId: newInvoice.id,
                    })
                )
            )
        }

        await invoiceCache.delPattern('list:*')
        await invoiceCache.delPattern(`userId:${userId}:*`)

        let paymentResult: {
            redirectUrl?: string
            clientSecret?: string
            transactionId?: string
            completed?: boolean
        } | null = null
        if (validated.gatewayPluginId) {
            try {
                const result = await processPaymentWithGateway({
                    gatewayPluginId: validated.gatewayPluginId,
                    invoiceId: newInvoice.id,
                    amount: amountInCents,
                    currency: validated.currency,
                    userId,
                    returnUrl: validated.returnUrl,
                    cancelUrl: validated.cancelUrl,
                    metadata: validated.metadata,
                })
                if (result) paymentResult = result
            } catch (err) {
                logger.error(`Gateway plugin payment init failed: ${err}`)
            }
        }

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            invoice: {
                id: newInvoice.id,
                uuid: newInvoice.id.toString(),
            },
            payment: paymentResult ?? undefined,
        })
    } catch (error: unknown) {
        logger.error(`Error creating invoice from checkout - ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err) => ({
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
