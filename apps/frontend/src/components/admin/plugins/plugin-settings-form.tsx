'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Checkbox from '@/components/ui/input/checkbox'
import type { PluginSettingsField } from '@/lib/plugins/types'

export interface PluginSettingsFormProps {
    settingsSchema: PluginSettingsField[]
    value: Record<string, unknown>
    onChange: (value: Record<string, unknown>) => void
    disabled?: boolean
}

/**
 * Renders a form from the plugin's settings schema (API keys, URLs, etc.).
 */
export default function PluginSettingsForm({
    settingsSchema,
    value,
    onChange,
    disabled = false,
}: PluginSettingsFormProps) {
    const update = (key: string, fieldValue: unknown) => {
        onChange({ ...value, [key]: fieldValue })
    }

    if (settingsSchema.length === 0) return null

    return (
        <div className="space-y-4">
            {settingsSchema.map((field) => {
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
                        <div key={field.key}>
                            <InputLabel htmlFor={field.key}>
                                {field.label}
                            </InputLabel>
                            <select
                                id={field.key}
                                value={String(current ?? '')}
                                onChange={(e) => {
                                    const opt = field.options?.find(
                                        (o) =>
                                            String(o.value) === e.target.value
                                    )
                                    update(
                                        field.key,
                                        opt?.value ?? e.target.value
                                    )
                                }}
                                disabled={disabled}
                                className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 block w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:ring-2 focus:outline-none"
                            >
                                <option value="">Select...</option>
                                {field.options?.map((o) => (
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
                const inputType =
                    field.type === 'number'
                        ? 'number'
                        : field.secret
                          ? 'password'
                          : 'text'
                return (
                    <div key={field.key}>
                        <InputLabel htmlFor={field.key}>
                            {field.label}
                        </InputLabel>
                        <Input
                            id={field.key}
                            type={inputType}
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
                            autoComplete={field.secret ? 'off' : undefined}
                            className="mt-1"
                        />
                    </div>
                )
            })}
        </div>
    )
}
