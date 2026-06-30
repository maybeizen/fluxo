'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
    fetchConfigurableOptionById,
    updateConfigurableOption,
    deleteConfigurableOption,
    type UpdateConfigurableOptionData,
} from '@/lib/admin/configurable-options'
import { fetchAdminPlugins } from '@/lib/admin/plugins'
import { fetchProducts } from '@/lib/admin/products'
import type { ServicePluginConfigField } from '@/lib/plugins/types'
import type { Product, ConfigurableOptionInputType } from '@fluxo/types'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Button from '@/components/ui/button'
import Checkbox from '@/components/ui/input/checkbox'
import Spinner from '@/components/ui/spinner'
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

export default function EditConfigurableOptionPage() {
    const params = useParams()
    const router = useRouter()
    const id = typeof params.id === 'string' ? params.id : ''
    const notifications = useNotifications()
    const [plugins, setPlugins] = useState<
        Awaited<ReturnType<typeof fetchAdminPlugins>>
    >([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
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

    useEffect(() => {
        if (!id) return
        setLoading(true)
        fetchConfigurableOptionById(id)
            .then((option) => {
                if (!option) {
                    notifications.error('Option not found')
                    router.push('/admin/configurable-options')
                    return
                }
                setPluginId(option.pluginId)
                setFieldKey(option.fieldKey)
                setLabel(option.label ?? '')
                setInputType(
                    (option as { type?: ConfigurableOptionInputType | null })
                        .type ?? ''
                )
                setDefaultValue(option.defaultValue ?? undefined)
                setOrder(option.order ?? 0)
                const scopes = option.scopes ?? []
                const withNull = scopes.some((s) => s.productId == null)
                setAllProducts(withNull)
                if (!withNull) {
                    setSelectedProductIds(
                        scopes.map((s) => s.productId!).filter(Boolean)
                    )
                }
                const p = option.pricing
                if (p) {
                    setEnablePricing(true)
                    setPricingType(p.pricingType as typeof pricingType)
                    setPricingAmount((p.amount / 100).toFixed(2))
                    setUseMultiplier(p.useValueAsMultiplier === 1)
                }
            })
            .catch(() => {
                notifications.error('Failed to load option')
                router.push('/admin/configurable-options')
            })
            .finally(() => setLoading(false))
    }, [id, router, notifications])

    const configFields = pluginId
        ? (plugins.find((p) => p.id === pluginId)?.configFields ?? [])
        : []
    const selectedField = configFields.find((f) => f.key === fieldKey)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!pluginId || !fieldKey) {
            notifications.error('Plugin and field are required')
            return
        }
        const scopes = allProducts
            ? [{ productId: null as number | null }]
            : selectedProductIds.map((pid) => ({ productId: pid }))

        const data: UpdateConfigurableOptionData = {
            pluginId,
            fieldKey,
            label: label || null,
            type: inputType || null,
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
        } else {
            data.pricing = null
        }

        setIsSaving(true)
        try {
            const result = await updateConfigurableOption(id, data)
            if (result.success) {
                notifications.success('Option updated')
                router.push('/admin/configurable-options')
            } else {
                notifications.error(result.message || 'Failed to update')
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
                notifications.error('Failed to update option')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Delete this configurable option? This cannot be undone.'))
            return
        const result = await deleteConfigurableOption(id)
        if (result.success) {
            notifications.success('Option deleted')
            router.push('/admin/configurable-options')
        } else {
            notifications.error(result.message || 'Failed to delete')
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

    const toggleProduct = (pid: number) => {
        setSelectedProductIds((prev) =>
            prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]
        )
    }

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Edit configurable option
                        </h1>
                        <p className="text-zinc-400">Option ID: {id}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() =>
                                router.push('/admin/configurable-options')
                            }
                            icon="fas fa-arrow-left"
                        >
                            Back
                        </Button>
                        <Button
                            variant="fail"
                            onClick={handleDelete}
                            icon="fas fa-trash"
                        >
                            Delete
                        </Button>
                    </div>
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
                                    How this option is shown to the customer.
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
                                                .filter((p) => {
                                                    const pid = Number(p.uuid)
                                                    return (
                                                        !Number.isNaN(pid) &&
                                                        !selectedProductIds.includes(
                                                            pid
                                                        )
                                                    )
                                                })
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
                                            Multiply by customer value
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
                            {isSaving ? 'Saving...' : 'Save'}
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
