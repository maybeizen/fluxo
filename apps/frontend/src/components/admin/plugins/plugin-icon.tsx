'use client'

import React, { useState } from 'react'
import { resolvePluginIconUrl } from '@/lib/plugins/icon-url'

interface PluginIconProps {
    id: string
    name: string
    iconUrl?: string | null
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
} as const

export default function PluginIcon({
    id,
    name,
    iconUrl,
    size = 'md',
    className = '',
}: PluginIconProps) {
    const [failed, setFailed] = useState(false)
    const src = resolvePluginIconUrl(id, iconUrl)
    const showFallback = !src || failed

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-xl bg-zinc-900 ${sizeClasses[size]} ${className}`}
        >
            {showFallback ? (
                <i
                    className="fas fa-plug text-zinc-500"
                    aria-hidden="true"
                    style={{ fontSize: size === 'sm' ? '1rem' : '1.25rem' }}
                />
            ) : (
                <img
                    src={src}
                    alt={`${name} icon`}
                    className="h-3/4 w-3/4 object-contain"
                    onError={() => setFailed(true)}
                />
            )}
        </div>
    )
}
