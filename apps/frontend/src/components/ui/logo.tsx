'use client'

import Image, { type ImageProps } from 'next/image'
import { useAppSettings } from '@/context/app-settings-context'
import { resolveStorageUrl } from '@/lib/storage'

interface LogoProps extends Partial<ImageProps> {
    width?: number
    height?: number
    className?: string
    src?: string
    logoUrl?: string
}

interface LogoContentProps extends LogoProps {
    contextLogoUrl: string | null
    isLoading: boolean
}

function LogoContent({
    src: propSrc,
    logoUrl: propLogoUrl,
    contextLogoUrl,
    isLoading,
    alt = 'Fluxo Logo',
    width = 100,
    height = 100,
    className = '',
    ...rest
}: LogoContentProps) {
    const hasExternalSource = Boolean(propSrc || propLogoUrl)
    const defaultSrc = '/logo.png'
    const resolvedLogoUrl = resolveStorageUrl(
        propLogoUrl || contextLogoUrl || undefined
    )
    const src = propSrc || resolvedLogoUrl || defaultSrc

    if (isLoading && !hasExternalSource) {
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

function LogoWithContext(props: LogoProps) {
    const { logoUrl: contextLogoUrl, isLoading } = useAppSettings()
    return (
        <LogoContent
            {...props}
            contextLogoUrl={contextLogoUrl}
            isLoading={isLoading}
        />
    )
}

export default function Logo(props: LogoProps) {
    if (props.src || props.logoUrl) {
        return (
            <LogoContent {...props} contextLogoUrl={null} isLoading={false} />
        )
    }

    return <LogoWithContext {...props} />
}
