'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { avatarVariant, type AvatarVariantSize } from '@/lib/storage'

type AvatarSizePreset = 'sm' | 'md' | 'lg'
type AvatarSize = AvatarSizePreset | number

const PRESET_DIMENSION: Record<AvatarSizePreset, number> = {
    sm: 40,
    md: 64,
    lg: 128,
}

const PRESET_VARIANT: Record<AvatarSizePreset, AvatarVariantSize> = {
    sm: 64,
    md: 256,
    lg: 'full',
}

interface AvatarProps {
    src?: string | null
    name: string
    size?: AvatarSize
    className?: string
    rounded?: 'full' | 'lg'
}

function getInitials(name: string): string {
    const trimmed = name.trim()
    if (!trimmed) return '?'

    const parts = trimmed.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }

    return trimmed.slice(0, 2).toUpperCase()
}

function variantForDimension(dimension: number): AvatarVariantSize {
    if (dimension <= 64) return 64
    if (dimension <= 256) return 256
    return 'full'
}

export default function Avatar({
    src,
    name,
    size = 'sm',
    className = '',
    rounded = 'full',
}: AvatarProps) {
    const [failed, setFailed] = useState(false)

    const displaySize = typeof size === 'number' ? size : PRESET_DIMENSION[size]
    const variantSize =
        typeof size === 'number'
            ? variantForDimension(size)
            : PRESET_VARIANT[size]

    const imageUrl = src ? avatarVariant(src, variantSize) : null
    const roundedClass = rounded === 'lg' ? 'rounded-lg' : 'rounded-full'

    useEffect(() => {
        setFailed(false)
    }, [imageUrl])

    return (
        <div
            className={`flex flex-shrink-0 items-center justify-center overflow-hidden bg-zinc-800 font-bold text-white uppercase ${roundedClass} ${className}`}
            style={{ width: displaySize, height: displaySize }}
        >
            {imageUrl && !failed ? (
                <Image
                    src={imageUrl}
                    alt={name}
                    width={displaySize}
                    height={displaySize}
                    className="h-full w-full object-cover"
                    unoptimized={/\.(jpe?g|png|gif)(\?|$)/i.test(imageUrl)}
                    onError={() => setFailed(true)}
                />
            ) : (
                <span
                    className="text-sm"
                    style={{
                        fontSize: Math.max(10, Math.floor(displaySize * 0.35)),
                    }}
                >
                    {getInitials(name)}
                </span>
            )}
        </div>
    )
}
