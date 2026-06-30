import { z } from 'zod'

/** Shape of a plugin config field (getConfigFields) for validation */
interface ConfigFieldShape {
    key: string
    label: string
    type: 'number' | 'string' | 'boolean' | 'select'
    required?: boolean
    default?: unknown
    options?: { value: string | number; label: string }[]
    min?: number
    max?: number
}

export type ConfigurableOptionPricingType =
    | 'one_time'
    | 'recurring'
    | 'billing_cycle'

export interface OptionRow {
    id: number
    pluginId: string
    fieldKey: string
    label: string | null
    defaultValue: unknown
    order: number
}

export interface ScopeRow {
    id: number
    optionId: number
    productId: number | null
    defaultValue: unknown
}

export interface PricingRow {
    id: number
    optionId: number
    pricingType: ConfigurableOptionPricingType
    amount: number
    useValueAsMultiplier: boolean
}

export interface OptionWithScopesAndPricing extends OptionRow {
    scopes: ScopeRow[]
    pricing: PricingRow | null
}

export interface ResolvedLineItem {
    optionId: number
    label: string
    value: unknown
    pricing: {
        type: ConfigurableOptionPricingType
        amountCents: number
    } | null
}

/**
 * Resolve effective values and line items for configurable options.
 * Merge order: option defaultValue -> scope defaultValue for productId -> userSelections.
 * No mutation; returns new objects.
 */
export function resolveConfigurableOptions(
    productId: number,
    options: OptionWithScopesAndPricing[],
    userSelections: Record<number, unknown>
): {
    effective: Record<number, unknown>
    lineItems: ResolvedLineItem[]
} {
    const effective: Record<number, unknown> = {}
    const lineItems: ResolvedLineItem[] = []

    for (const option of options) {
        const scopeForProduct =
            option.scopes.find((s) => s.productId === productId) ??
            option.scopes.find((s) => s.productId === null)
        const scopeDefault =
            scopeForProduct?.defaultValue !== undefined &&
            scopeForProduct?.defaultValue !== null
                ? scopeForProduct.defaultValue
                : undefined

        let base: unknown = option.defaultValue
        if (scopeDefault !== undefined) base = scopeDefault
        if (userSelections[option.id] !== undefined)
            base = userSelections[option.id]

        effective[option.id] = base

        const displayLabel = option.label ?? option.fieldKey
        if (option.pricing && base !== undefined && base !== null) {
            let amountCents = option.pricing.amount
            if (
                option.pricing.useValueAsMultiplier &&
                typeof base === 'number'
            ) {
                amountCents = Math.round(option.pricing.amount * base)
            }
            lineItems.push({
                optionId: option.id,
                label: displayLabel,
                value: base,
                pricing: {
                    type: option.pricing.pricingType,
                    amountCents,
                },
            })
        } else if (base !== undefined && base !== null) {
            lineItems.push({
                optionId: option.id,
                label: displayLabel,
                value: base,
                pricing: null,
            })
        }
    }

    return { effective, lineItems }
}

export function getPluginConfigField(
    pluginId: string,
    fieldKey: string,
    getService: (
        id: string
    ) => Promise<{ getConfigFields(): ConfigFieldShape[] } | null>
): Promise<ConfigFieldShape | null> {
    return getService(pluginId).then((plugin) => {
        if (!plugin?.getConfigFields) return null
        const fields = plugin.getConfigFields()
        return fields.find((f) => f.key === fieldKey) ?? null
    })
}

/**
 * Build a Zod schema for a single config field (for validating option default or user value).
 */
export function zodSchemaForConfigField(
    field: ConfigFieldShape
): z.ZodType<unknown> {
    let base: z.ZodType<unknown>
    switch (field.type) {
        case 'number': {
            let num = z.coerce.number()
            if (field.min !== undefined) num = num.min(field.min)
            if (field.max !== undefined) num = num.max(field.max)
            base = num
            break
        }
        case 'boolean':
            base = z.boolean()
            break
        case 'select':
            if (field.options?.length) {
                base = z.union(
                    field.options.map((o: { value: string | number }) =>
                        z.literal(o.value)
                    ) as [
                        z.ZodLiteral<string | number>,
                        z.ZodLiteral<string | number>,
                        ...z.ZodLiteral<string | number>[],
                    ]
                )
            } else {
                base = z.union([z.string(), z.number()])
            }
            break
        case 'string':
        default:
            let str = z.string()
            if (field.min !== undefined) str = str.min(field.min)
            if (field.max !== undefined) str = str.max(field.max)
            base = str
            break
    }
    if (!field.required) {
        base = base.optional().nullable()
    }
    return base
}

/**
 * Build config overrides from an invoice's configurable option selections.
 * Returns { [fieldKey]: value } to merge over product integration config when provisioning.
 */
export async function getConfigOverridesForInvoice(
    invoiceId: number
): Promise<Record<string, unknown>> {
    const { getDb, userConfigSelections, configurableOptions, eq, inArray } =
        await import('@fluxo/db')
    const db = getDb()
    const selections = await db
        .select({
            optionId: userConfigSelections.optionId,
            value: userConfigSelections.value,
        })
        .from(userConfigSelections)
        .where(eq(userConfigSelections.invoiceId, invoiceId))
    if (!selections.length) return {}
    const optionIds = [...new Set(selections.map((s) => s.optionId))]
    const options = await db
        .select({
            id: configurableOptions.id,
            fieldKey: configurableOptions.fieldKey,
        })
        .from(configurableOptions)
        .where(inArray(configurableOptions.id, optionIds))
    const keyById = new Map(
        options.map((o: { id: number; fieldKey: string }) => [o.id, o.fieldKey])
    )
    const overrides: Record<string, unknown> = {}
    for (const s of selections) {
        const fieldKey = keyById.get(s.optionId)
        if (fieldKey != null) overrides[fieldKey] = s.value
    }
    return overrides
}
