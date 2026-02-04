'use client'

import React, { Suspense, useState, useEffect } from 'react'
import type { ServicePluginConfigField } from '@/lib/plugins/loader'
import { getServicePluginConfigComponent } from '@/lib/plugins/loader'
import { fetchPluginFieldOptions } from '@/lib/admin/plugins'
import type { PluginFieldOption } from '@/lib/admin/plugins'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Checkbox from '@/components/ui/input/checkbox'
import Spinner from '@/components/ui/spinner'

export interface ServicePluginConfigFormProps {
    pluginId: string
    configFields: ServicePluginConfigField[]
    value: Record<string, unknown>
    onChange: (value: Record<string, unknown>) => void
    disabled?: boolean
}

/**
 * Renders either the plugin-specific config component (if registered) or a generic form from configFields.
 */
export default function ServicePluginConfigForm({
    pluginId,
    configFields,
    value,
    onChange,
    disabled = false,
}: ServicePluginConfigFormProps) {
    const [PluginComponent, setPluginComponent] = useState<React.ComponentType<{
        value: Record<string, unknown>
        onChange: (v: Record<string, unknown>) => void
        configFields: ServicePluginConfigField[]
        disabled?: boolean
    }> | null>(null)

    useEffect(() => {
        const loader = getServicePluginConfigComponent(pluginId)
        if (!loader) {
            queueMicrotask(() => setPluginComponent(null))
            return
        }
        loader().then((mod) => setPluginComponent(() => mod.default))
    }, [pluginId])

    if (PluginComponent) {
        return (
            <Suspense fallback={<Spinner />}>
                <PluginComponent
                    value={value}
                    onChange={onChange}
                    configFields={configFields}
                    disabled={disabled}
                />
            </Suspense>
        )
    }

    return (
        <GenericPluginConfigForm
            pluginId={pluginId}
            configFields={configFields}
            value={value}
            onChange={onChange}
            disabled={disabled}
        />
    )
}

function GenericPluginConfigForm({
    pluginId,
    configFields,
    value,
    onChange,
    disabled,
}: {
    pluginId: string
    configFields: ServicePluginConfigField[]
    value: Record<string, unknown>
    onChange: (value: Record<string, unknown>) => void
    disabled?: boolean
}) {
    const update = (key: string, fieldValue: unknown) => {
        const next = { ...value, [key]: fieldValue }
        if (key === 'nestId') next.eggId = undefined
        onChange(next)
    }

    if (configFields.length === 0) return null

    return (
        <div className="space-y-4">
            {configFields.map((field) => {
                const current = value[field.key] ?? field.default
                if (field.type === 'boolean') {
                    return (
                        <div
                            key={field.key}
                            className="flex items-center gap-2"
                        >
                            <Checkbox
                                id={field.key}
                                checked={Boolean(current)}
                                onChange={(e) =>
                                    update(field.key, e.target.checked)
                                }
                                disabled={disabled}
                            />
                            <InputLabel htmlFor={field.key}>
                                {field.label}
                            </InputLabel>
                        </div>
                    )
                }
                if (field.type === 'select') {
                    return (
                        <DynamicSelectField
                            key={field.key}
                            pluginId={pluginId}
                            field={field}
                            current={current}
                            value={value}
                            update={update}
                            disabled={disabled}
                        />
                    )
                }
                return (
                    <div key={field.key}>
                        <InputLabel htmlFor={field.key}>
                            {field.label}
                        </InputLabel>
                        <Input
                            id={field.key}
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={current != null ? String(current) : ''}
                            onChange={(e) =>
                                update(
                                    field.key,
                                    field.type === 'number'
                                        ? e.target.value
                                            ? Number(e.target.value)
                                            : 0
                                        : e.target.value
                                )
                            }
                            placeholder={field.placeholder}
                            min={field.min}
                            max={field.max}
                            disabled={disabled}
                        />
                    </div>
                )
            })}
        </div>
    )
}

function DynamicSelectField({
    pluginId,
    field,
    current,
    value,
    update,
    disabled,
}: {
    pluginId: string
    field: ServicePluginConfigField
    current: unknown
    value: Record<string, unknown>
    update: (key: string, val: unknown) => void
    disabled?: boolean
}) {
    const [options, setOptions] = useState<PluginFieldOption[]>([])
    const [loading, setLoading] = useState(false)

    const context = { ...value }
    const contextKey = JSON.stringify(context)

    useEffect(() => {
        if (!field.dynamicOptions) return
        const id = setTimeout(() => setLoading(true), 0)
        fetchPluginFieldOptions(pluginId, field.key, context)
            .then(setOptions)
            .finally(() => setLoading(false))
        return () => clearTimeout(id)
    }, [pluginId, field.key, field.dynamicOptions, contextKey])

    const optionsList = field.dynamicOptions ? options : (field.options ?? [])

    return (
        <div>
            <InputLabel htmlFor={field.key}>{field.label}</InputLabel>
            <select
                id={field.key}
                value={String(current ?? '')}
                onChange={(e) => {
                    const opt = optionsList.find(
                        (o) => String(o.value) === e.target.value
                    )
                    const nextVal =
                        opt?.value ??
                        (field.type === 'number'
                            ? Number(e.target.value) || undefined
                            : e.target.value)
                    update(field.key, nextVal)
                }}
                disabled={disabled || loading}
                className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 block w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-white placeholder-zinc-400 focus:ring-2 focus:outline-none"
            >
                <option value="">{loading ? 'Loading...' : 'Select...'}</option>
                {optionsList.map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
