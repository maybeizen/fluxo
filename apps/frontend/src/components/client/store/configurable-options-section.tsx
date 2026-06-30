'use client'

import React, { useState, useEffect } from 'react'
import { fetchOptionsForProduct } from '@/lib/client/configurable-options'
import type { ConfigurableOptionForProduct } from '@fluxo/types'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Checkbox from '@/components/ui/input/checkbox'
import Card from '@/components/ui/card'
import Spinner from '@/components/ui/spinner'

interface ConfigurableOptionsSectionProps {
    productId: number
    selections: Record<number, unknown>
    onChange: (selections: Record<number, unknown>) => void
}

export default function ConfigurableOptionsSection({
    productId,
    selections,
    onChange,
}: ConfigurableOptionsSectionProps) {
    const [options, setOptions] = useState<ConfigurableOptionForProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetchOptionsForProduct(productId)
            .then((list) => {
                setOptions(list)
            })
            .finally(() => setLoading(false))
    }, [productId])

    const update = (optionId: number, value: unknown) => {
        onChange({ ...selections, [optionId]: value })
    }

    if (loading) {
        return (
            <Card padding="lg">
                <div className="flex items-center justify-center py-8">
                    <Spinner />
                </div>
            </Card>
        )
    }

    if (options.length === 0) return null

    return (
        <Card padding="lg">
            <h2 className="mb-4 text-xl font-semibold text-white">
                Add-ons & options
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
                Customize your order with the options below.
            </p>
            <div className="space-y-4">
                {options.map((opt) => {
                    const schema = opt.schema
                    const value =
                        selections[opt.id] ??
                        opt.defaultValue ??
                        schema?.default
                    const displayLabel = opt.label || opt.fieldKey
                    if (!schema) {
                        return (
                            <div key={opt.id}>
                                <InputLabel>{displayLabel}</InputLabel>
                                <Input
                                    type="text"
                                    value={
                                        value === undefined || value === null
                                            ? ''
                                            : String(value)
                                    }
                                    onChange={(e) =>
                                        update(
                                            opt.id,
                                            e.target.value || undefined
                                        )
                                    }
                                />
                            </div>
                        )
                    }
                    if (schema.type === 'boolean') {
                        return (
                            <div
                                key={opt.id}
                                className="flex items-center gap-2"
                            >
                                <Checkbox
                                    id={`opt-${opt.id}`}
                                    checked={Boolean(value)}
                                    onChange={(e) =>
                                        update(opt.id, e.target.checked)
                                    }
                                />
                                <InputLabel htmlFor={`opt-${opt.id}`}>
                                    {displayLabel}
                                    {opt.pricing && (
                                        <span className="ml-2 text-zinc-500">
                                            (+$
                                            {(opt.pricing.amount / 100).toFixed(
                                                2
                                            )}
                                            {opt.pricing.useValueAsMultiplier
                                                ? ' × value'
                                                : ''}
                                            )
                                        </span>
                                    )}
                                </InputLabel>
                            </div>
                        )
                    }
                    if (schema.type === 'select') {
                        return (
                            <div key={opt.id}>
                                <InputLabel htmlFor={`opt-${opt.id}`}>
                                    {displayLabel}
                                    {opt.pricing && (
                                        <span className="ml-2 text-zinc-500">
                                            (+$
                                            {(opt.pricing.amount / 100).toFixed(
                                                2
                                            )}
                                            )
                                        </span>
                                    )}
                                </InputLabel>
                                <select
                                    id={`opt-${opt.id}`}
                                    value={
                                        value === undefined || value === null
                                            ? ''
                                            : String(value)
                                    }
                                    onChange={(e) => {
                                        const v = e.target.value
                                        const o = schema.options?.find(
                                            (x) => String(x.value) === v
                                        )
                                        update(opt.id, o?.value ?? v)
                                    }}
                                    className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 block w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-sm text-white focus:ring-2 focus:outline-none"
                                >
                                    <option value="">—</option>
                                    {schema.options?.map((o) => (
                                        <option
                                            key={String(o.value)}
                                            value={String(o.value)}
                                        >
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )
                    }
                    if (schema.type === 'number') {
                        return (
                            <div key={opt.id}>
                                <InputLabel htmlFor={`opt-${opt.id}`}>
                                    {displayLabel}
                                    {opt.pricing && (
                                        <span className="ml-2 text-zinc-500">
                                            (
                                            {opt.pricing.useValueAsMultiplier
                                                ? '$' +
                                                  (
                                                      opt.pricing.amount / 100
                                                  ).toFixed(2) +
                                                  ' × value'
                                                : '$' +
                                                  (
                                                      opt.pricing.amount / 100
                                                  ).toFixed(2)}
                                            )
                                        </span>
                                    )}
                                </InputLabel>
                                <Input
                                    id={`opt-${opt.id}`}
                                    type="number"
                                    min={schema.min}
                                    max={schema.max}
                                    value={
                                        value === undefined || value === null
                                            ? ''
                                            : String(value)
                                    }
                                    onChange={(e) => {
                                        const v = e.target.value
                                        update(
                                            opt.id,
                                            v === '' ? undefined : Number(v)
                                        )
                                    }}
                                />
                            </div>
                        )
                    }
                    return (
                        <div key={opt.id}>
                            <InputLabel htmlFor={`opt-${opt.id}`}>
                                {displayLabel}
                            </InputLabel>
                            <Input
                                id={`opt-${opt.id}`}
                                type="text"
                                value={
                                    value === undefined || value === null
                                        ? ''
                                        : String(value)
                                }
                                onChange={(e) =>
                                    update(opt.id, e.target.value || undefined)
                                }
                            />
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
