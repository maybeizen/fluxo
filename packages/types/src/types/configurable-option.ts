export type ConfigurableOptionPricingType =
    | 'one_time'
    | 'recurring'
    | 'billing_cycle'

export interface ConfigurableOptionScope {
    id: number
    optionId: number
    productId: number | null
    defaultValue: unknown
    createdAt?: Date
    updatedAt?: Date
}

export interface ConfigurableOptionPricing {
    id: number
    optionId: number
    pricingType: ConfigurableOptionPricingType
    amount: number
    useValueAsMultiplier: number
    createdAt?: Date
    updatedAt?: Date
}

/** Display/input type for the option. When null, frontend uses plugin field type. */
export type ConfigurableOptionInputType =
    | 'text'
    | 'number'
    | 'checkbox'
    | 'select'

export interface ConfigurableOption {
    id: number
    pluginId: string
    fieldKey: string
    label: string | null
    /** Override how the option is rendered: text, number, checkbox, select. Null = use plugin field type. */
    type: ConfigurableOptionInputType | null
    defaultValue: unknown
    order: number
    createdAt?: Date
    updatedAt?: Date
    scopes?: ConfigurableOptionScope[]
    pricing?: ConfigurableOptionPricing | null
}

export interface ConfigurableOptionSchemaField {
    type: 'number' | 'string' | 'boolean' | 'select'
    label: string
    required?: boolean
    default?: unknown
    options?: { value: string | number; label: string }[]
    min?: number
    max?: number
}

export interface ConfigurableOptionForProduct extends ConfigurableOption {
    schema: ConfigurableOptionSchemaField | null
}

export interface UserConfigSelection {
    id: number
    userId: number
    optionId: number
    value: unknown
    invoiceId: number | null
    createdAt?: Date
}
