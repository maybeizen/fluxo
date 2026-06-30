'use client'

import React from 'react'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

interface CopyIdCellProps {
    id: string
    label?: string
    truncate?: boolean
    className?: string
}

export default function CopyIdCell({
    id,
    label = 'ID',
    truncate = true,
    className = '',
}: CopyIdCellProps) {
    const { copy, copiedId } = useCopyToClipboard()

    return (
        <button
            type="button"
            onClick={() => copy(id, label)}
            className={`group hover:text-foreground focus:ring-primary-400 flex w-fit items-center gap-2 rounded text-left transition-colors focus:ring-2 focus:outline-none ${className}`}
            title={`Click to copy ${label.toLowerCase()}`}
            aria-label={`Copy ${label.toLowerCase()} ${id}`}
        >
            <span
                className={`text-muted group-hover:text-foreground font-mono text-xs ${truncate ? 'max-w-[8rem] truncate' : ''}`}
            >
                {id}
            </span>
            <i
                className={`fas ${copiedId === id ? 'fa-check text-green-500' : 'fa-copy text-muted group-hover:text-foreground'} flex-shrink-0 text-xs`}
                aria-hidden="true"
            />
        </button>
    )
}
