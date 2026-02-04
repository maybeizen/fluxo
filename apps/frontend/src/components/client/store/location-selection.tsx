'use client'

import React from 'react'

interface Location {
    value: string
    label: string
    flag: string
}

const LOCATIONS: Location[] = [
    { value: 'new-york', label: 'New York, USA', flag: '🇺🇸' },
    { value: 'miami', label: 'Florida, USA', flag: '🇺🇸' },
    { value: 'germany', label: 'Germany, DE', flag: '🇩🇪' },
    { value: 'singapore', label: 'Singapore, SG', flag: '🇸🇬' },
]

interface LocationSelectionProps {
    location: string
    onLocationChange: (location: string) => void
}

export default function LocationSelection({
    location,
    onLocationChange,
}: LocationSelectionProps) {
    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 lg:p-8">
            <h2 className="mb-2 text-xl font-semibold text-white">
                Step 2: Choose Location
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
                Choose the location nearest to you or your players.
            </p>

            <div className="grid grid-cols-2 gap-4">
                {LOCATIONS.map((loc) => (
                    <button
                        key={loc.value}
                        type="button"
                        onClick={() => onLocationChange(loc.value)}
                        className={`relative cursor-pointer overflow-hidden rounded-lg border-2 p-4 text-left transition-all ${
                            location === loc.value
                                ? 'border-primary-400 bg-zinc-900/50'
                                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                        }`}
                    >
                        {loc.value === 'singapore' && (
                            <div className="absolute top-0 right-0 rounded-bl-lg border-b border-l border-yellow-500/50 bg-yellow-500/20 px-2 py-1">
                                <p className="text-xs whitespace-nowrap text-yellow-400">
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    15% extra
                                </p>
                            </div>
                        )}
                        <p className="font-medium text-white">
                            {loc.flag} {loc.label}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}
