import React from 'react'
import { formatDate, formatShortDate } from '@/utils/formatting'

export interface FormattedDateProps {
    date: Date | string | null | undefined
    variant?: 'full' | 'short' | 'datetime'
    fallback?: string
    className?: string
}
export default function FormattedDate({
    date,
    variant = 'short',
    fallback = 'N/A',
    className = '',
}: FormattedDateProps) {
    if (!date) {
        return <span className={className}>{fallback}</span>
    }

    let formatted: string

    switch (variant) {
        case 'full':
            formatted = formatDate(date)
            break
        case 'short':
            formatted = formatShortDate(date)
            break
        case 'datetime':
            formatted = new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            })
            break
        default:
            formatted = formatShortDate(date)
    }

    return <span className={className}>{formatted}</span>
}
