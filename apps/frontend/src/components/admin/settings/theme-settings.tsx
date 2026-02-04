'use client'

import React from 'react'
import InputLabel from '@/components/ui/input/input-label'
import { useTheme } from '@/context/theme-context'

interface ThemeSettingsProps {
    themeColor: string
    onChange: (updates: { themeColor: string }) => void
}

const PRESET_COLORS = [
    { name: 'Yellow', value: '#ffd952' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Cyan', value: '#06b6d4' },
]

export default function ThemeSettings({
    themeColor,
    onChange,
}: ThemeSettingsProps) {
    const { setThemeColor } = useTheme()

    const handleColorChange = (color: string) => {
        onChange({ themeColor: color })
        setThemeColor(color)
    }

    return (
        <div>
            <h2 className="mb-6 text-xl font-semibold text-white">
                Theme Settings
            </h2>
            <div className="space-y-6">
                <div>
                    <InputLabel htmlFor="themeColor">Theme Color</InputLabel>
                    <div className="mt-2 flex items-center gap-4">
                        <input
                            id="themeColor"
                            type="color"
                            value={themeColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="h-12 w-24 cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900"
                        />
                        <input
                            type="text"
                            value={themeColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="focus:border-primary-400 focus:ring-primary-400 flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:ring-1 focus:outline-none"
                            placeholder="#ffd952"
                            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                        />
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">
                        Choose a color to customize your site&apos;s theme
                    </p>
                </div>

                <div>
                    <InputLabel>Preset Colors</InputLabel>
                    <div className="mt-2 grid grid-cols-4 gap-3 sm:grid-cols-8">
                        {PRESET_COLORS.map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => handleColorChange(preset.value)}
                                className={`group relative h-12 w-full rounded-lg border-2 transition-all ${
                                    themeColor.toLowerCase() ===
                                    preset.value.toLowerCase()
                                        ? 'border-primary-400 ring-primary-400/20 ring-2'
                                        : 'border-zinc-800 hover:border-zinc-700'
                                }`}
                                style={{ backgroundColor: preset.value }}
                                title={preset.name}
                            >
                                {themeColor.toLowerCase() ===
                                    preset.value.toLowerCase() && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <i className="fas fa-check text-white drop-shadow-lg"></i>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <i className="fas fa-palette text-primary-400"></i>
                        <span className="text-sm font-medium text-white">
                            Preview
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="bg-primary-400 hover:bg-primary-500 rounded-lg px-4 py-2 text-sm font-medium"
                            style={{ color: 'var(--color-primary-400-text)' }}
                        >
                            Primary Button
                        </button>
                        <button
                            type="button"
                            className="border-primary-400 bg-primary-400/10 text-primary-400 hover:bg-primary-400/20 rounded-lg border px-4 py-2 text-sm font-medium"
                        >
                            Secondary Button
                        </button>
                        <span className="bg-primary-400/10 text-primary-400 rounded-lg px-3 py-1 text-sm">
                            Badge
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
