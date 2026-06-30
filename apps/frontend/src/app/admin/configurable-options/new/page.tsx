'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    createConfigurableOption,
    type CreateConfigurableOptionData,
} from '@/lib/admin/configurable-options'
import { fetchAdminPlugins } from '@/lib/admin/plugins'
import { fetchProducts } from '@/lib/admin/products'
import type { ServicePluginConfigField } from '@/lib/plugins/types'
import type { Product, ConfigurableOptionInputType } from '@fluxo/types'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Button from '@/components/ui/button'
import Checkbox from '@/components/ui/input/checkbox'
import { useNotifications } from '@/context/notification-context'

const PRICING_TYPES = [
    { value: 'one_time', label: 'One-time' },
    { value: 'recurring', label: 'Recurring' },
    { value: 'billing_cycle', label: 'Per billing cycle' },
] as const

const INPUT_TYPES: {
    value: ConfigurableOptionInputType | ''
    label: string
}[] = [
    { value: '', label: 'Use plugin field type' },
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'select', label: 'Select' },
]

export default function NewConfigurableOptionPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const [plugins, setPlugins] = useState<
        Awaited<ReturnType<typeof fetchAdminPlugins>>
    >([])
    const [products, setProducts] = useState<Product[]>([])
    const [pluginId, setPluginId] = useState('')
    const [fieldKey, setFieldKey] = useState('')
    const [label, setLabel] = useState('')
    const [inputType, setInputType] = useState<
        ConfigurableOptionInputType | ''
    >('')
    const [defaultValue, setDefaultValue] = useState<unknown>(undefined)
    const [order, setOrder] = useState(0)
    const [allProducts, setAllProducts] = useState(true)
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
    const [pricingType, setPricingType] = useState<
        'one_time' | 'recurring' | 'billing_cycle'
    >('one_time')
    const [pricingAmount, setPricingAmount] = useState('')
    const [useMultiplier, setUseMultiplier] = useState(false)
    const [enablePricing, setEnablePricing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchAdminPlugins().then((list) => {
            setPlugins(
                list.filter(
                    (p) =>
                        p.type === 'service' &&
                        (p.configFields?.length ?? 0) > 0
                )
            )
        })
    }, [])

    useEffect(() => {
        fetchProducts({ limit: 1000 })
            .then((r) => setProducts(r.products ?? []))
            .catch(() => setProducts([]))
    }, [])

    const configFields = pluginId
        ? (plugins.find((p) => p.id === pluginId)?.configFields ?? [])
        : []
    const selectedField = configFields.find((f) => f.key === fieldKey)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!pluginId || !fieldKey) {
            notifications.error('Please select a plugin and field')
            return
        }
        const scopes = allProducts
            ? [{ productId: null as number | null }]
            : selectedProductIds.map((id) => ({ productId: id }))

        const data: CreateConfigurableOptionData = {
            pluginId,
            fieldKey,
            label: label || undefined,
            type: inputType || undefined,
            defaultValue:
                defaultValue !== undefined && defaultValue !== ''
                    ? defaultValue
                    : undefined,
            order,
            scopes,
        }
        if (enablePricing && pricingAmount !== '') {
            const amountCents = Math.round(parseFloat(pricingAmount) * 100)
            if (amountCents >= 0) {
                data.pricing = {
                    pricingType,
                    amount: amountCents,
                    useMultiplier,
                }
            }
        }

        setIsSaving(true)
        try {
            const result = await createConfigurableOption(data)
            if (result.success) {
                notifications.success('Configurable option created')
                router.push('/admin/configurable-options')
            } else {
                notifications.error(result.message || 'Failed to create')
            }
        } catch (err: unknown) {
            const ax =
                err && typeof err === 'object' && 'response' in err
                    ? (
                          err as {
                              response?: {
                                  data?: {
                                      errors?: Array<{
                                          field?: string
                                          message?: string
                                      }>
                                  }
                              }
                          }
                      ).response
                    : undefined
            const errors = ax?.data?.errors
            if (errors?.length) {
                notifications.error(
                    errors.map((e) => `${e.field}: ${e.message}`).join(', ')
                )
            } else {
                notifications.error('Failed to create option')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const renderDefaultValueInput = (field: ServicePluginConfigField) => {
        const type = (inputType || field.type) as
            'boolean' | 'select' | 'number' | string
        if (type === 'boolean' || type === 'checkbox') {
            return (
                <Checkbox
                    id="defaultValue"
                    checked={Boolean(defaultValue)}
                    onChange={(e) => setDefaultValue(e.target.checked)}
                />
            )
        }
        if (type === 'select') {
            return (
                <select
                    id="defaultValue"
                    value={
                        defaultValue === undefined || defaultValue === null
                            ? ''
                            : String(defaultValue)
                    }
                    onChange={(e) => {
                        const v = e.target.value
                        const opt = field.options?.find(
                            (o) => String(o.value) === v
                        )
                        setDefaultValue(opt?.value ?? v)
                    }}
                    className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 block w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-sm text-white focus:ring-2 focus:outline-none"
                >
                    <option value="">—</option>
                    {field.options?.map((o) => (
                        <option key={String(o.value)} value={String(o.value)}>
                            {o.label}
                        </option>
                    ))}
                </select>
            )
        }
        if (type === 'number') {
            return (
                <Input
                    id="defaultValue"
                    type="number"
                    value={
                        defaultValue === undefined || defaultValue === null
                            ? ''
                            : String(defaultValue)
                    }
                    onChange={(e) =>
                        setDefaultValue(
                            e.target.value === ''
                                ? undefined
                                : Number(e.target.value)
                        )
                    }
                    min={field.min}
                    max={field.max}
                />
            )
        }
        return (
            <Input
                id="defaultValue"
                type="text"
                value={
                    defaultValue === undefined || defaultValue === null
                        ? ''
                        : String(defaultValue)
                }
                onChange={(e) => setDefaultValue(e.target.value || undefined)}
            />
        )
    }

    const toggleProduct = (id: number) => {
        setSelectedProductIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            New configurable option
                        </h1>
                        <p className="text-zinc-400">
                            Add an option that customers can set when ordering
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() =>
                            router.push('/admin/configurable-options')
                        }
                        icon="fas fa-arrow-left"
                    >
                        Back
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-4 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Option
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="pluginId" required>
                                    Plugin
                                </InputLabel>
                                <select
                                    id="pluginId"
                                    value={pluginId}
                                    onChange={(e) => {
                                        setPluginId(e.target.value)
                                        setFieldKey('')
                                        setDefaultValue(undefined)
                                    }}
                                    className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 block w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-sm text-white focus:ring-2 focus:outline-none"
                                    required
                                >
                                    <option value="">Select plugin</option>
                                    {plugins.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel htmlFor="fieldKey" required>
                                    Field
                                </InputLabel>
                                <select
                                    id="fieldKey"
                                    value={fieldKey}
                                    onChange={(e) => {
                                        setFieldKey(e.target.value)
                                        const f = configFields.find(
                                            (x) => x.key === e.target.value
                                        )
                                        setDefaultValue(f?.default)
                                    }}
                                    className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 block w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-sm text-white focus:ring-2 focus:outline-none"
                                    required
                                >
                                    <option value="">Select field</option>
                                    {configFields.map((f) => (
                                        <option key={f.key} value={f.key}>
                                            {f.label} ({f.key})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel htmlFor="label">
                                    Label override
                                </InputLabel>
                                <Input
                                    id="label"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="Leave empty to use field label"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="inputType">
                                    Display type
                                </InputLabel>
                                <select
                                    id="inputType"
                                    value={inputType}
                                    onChange={(e) =>
                                        setInputType(
                                            (e.target.value || '') as
                                                ConfigurableOptionInputType | ''
                                        )
                                    }
                                    className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 block w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-sm text-white focus:ring-2 focus:outline-none"
                                >
                                    {INPUT_TYPES.map((t) => (
                                        <option
                                            key={t.value || '_'}
                                            value={t.value}
                                        >
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-zinc-500">
                                    How this option is shown to the customer
                                    (text, number, checkbox, select).
                                </p>
                            </div>
                            <div>
                                <InputLabel htmlFor="order">Order</InputLabel>
                                <Input
                                    id="order"
                                    type="number"
                                    min={0}
                                    value={order}
                                    onChange={(e) =>
                                        setOrder(
                                            parseInt(e.target.value, 10) || 0
                                        )
                                    }
                                />
                            </div>
                            {selectedField && (
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="defaultValue">
                                        Default value
                                    </InputLabel>
                                    {renderDefaultValueInput(selectedField)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-4 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Product scoping
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="allProducts"
                                    checked={allProducts}
                                    onChange={(e) =>
                                        setAllProducts(e.target.checked)
                                    }
                                />
                                <InputLabel htmlFor="allProducts">
                                    Apply to all products
                                </InputLabel>
                            </div>
                            {!allProducts && (
                                <div>
                                    <InputLabel>
                                        Applies to these products
                                    </InputLabel>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Click &quot;Add product&quot; to include
                                        a product. Remove with the × on each
                                        chip.
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2 rounded border border-zinc-800 bg-neutral-900/30 p-3">
                                        {selectedProductIds.map((pid) => {
                                            const p = products.find(
                                                (x) => Number(x.uuid) === pid
                                            )
                                            return (
                                                <span
                                                    key={pid}
                                                    className="inline-flex items-center gap-1 rounded-full bg-zinc-700 px-3 py-1 text-sm text-white"
                                                >
                                                    {p?.metadata?.name ??
                                                        `Product ${pid}`}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleProduct(pid)
                                                        }
                                                        className="rounded-full p-0.5 transition-colors hover:bg-zinc-600"
                                                        aria-label="Remove"
                                                    >
                                                        <i className="fas fa-times text-xs" />
                                                    </button>
                                                </span>
                                            )
                                        })}
                                        <select
                                            value=""
                                            onChange={(e) => {
                                                const v = e.target.value
                                                if (v) toggleProduct(Number(v))
                                                e.target.value = ''
                                            }}
                                            className="focus:border-primary-500 rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="">
                                                Add product…
                                            </option>
                                            {products
                                                .filter(
                                                    (p) =>
                                                        !selectedProductIds.includes(
                                                            Number(p.uuid)
                                                        )
                                                )
                                                .map((p) => (
                                                    <option
                                                        key={p.uuid}
                                                        value={p.uuid}
                                                    >
                                                        {p.metadata?.name ??
                                                            p.uuid}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-4 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Pricing
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="enablePricing"
                                    checked={enablePricing}
                                    onChange={(e) =>
                                        setEnablePricing(e.target.checked)
                                    }
                                />
                                <InputLabel htmlFor="enablePricing">
                                    Add pricing for this option
                                </InputLabel>
                            </div>
                            {enablePricing && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="pricingType">
                                            Type
                                        </InputLabel>
                                        <select
                                            id="pricingType"
                                            value={pricingType}
                                            onChange={(e) =>
                                                setPricingType(
                                                    e.target
                                                        .value as typeof pricingType
                                                )
                                            }
                                            className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 block w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-sm text-white focus:ring-2 focus:outline-none"
                                        >
                                            {PRICING_TYPES.map((o) => (
                                                <option
                                                    key={o.value}
                                                    value={o.value}
                                                >
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="pricingAmount">
                                            Amount ($)
                                        </InputLabel>
                                        <Input
                                            id="pricingAmount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={pricingAmount}
                                            onChange={(e) =>
                                                setPricingAmount(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 md:col-span-2">
                                        <Checkbox
                                            id="useMultiplier"
                                            checked={useMultiplier}
                                            onChange={(e) =>
                                                setUseMultiplier(
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <InputLabel htmlFor="useMultiplier">
                                            Multiply by customer value (e.g.
                                            quantity)
                                        </InputLabel>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSaving}
                            icon="fas fa-save"
                        >
                            {isSaving ? 'Creating...' : 'Create'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                                router.push('/admin/configurable-options')
                            }
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
