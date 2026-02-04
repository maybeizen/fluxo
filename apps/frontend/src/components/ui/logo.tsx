'use client'

import Image, { ImageProps } from 'next/image'
import { useAppLogo } from '@/hooks/use-app-logo'

interface LogoProps extends Partial<ImageProps> {
    width?: number
    height?: number
    className?: string
    src?: string
    logoUrl?: string
}

export default function Logo({
    src: propSrc,
    logoUrl: propLogoUrl,
    alt = 'Fluxo Logo',
    width = 100,
    height = 100,
    className = '',
    ...rest
}: LogoProps) {
    const { logoUrl: hookLogoUrl, isLoading } = useAppLogo()
    const defaultSrc = '/logo.png'
    const logoUrl = propLogoUrl || hookLogoUrl
    const src = propSrc || logoUrl || defaultSrc

    if (isLoading && !propSrc && !propLogoUrl) {
        return (
            <div
                className={`animate-pulse bg-zinc-800 ${className}`}
                style={{ width, height }}
            />
        )
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            {...rest}
        />
    )
}
