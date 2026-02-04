import React from 'react'
import { formatPrice, formatAmount } from '@/utils/formatting'

export interface FormattedPriceProps {
    value: number
    currency?: string
    variant?: 'price' | 'amount'
    className?: string
    showCurrency?: boolean
}

export default function FormattedPrice({
    value,
    currency = 'USD',
    variant = 'price',
    className = '',
}: FormattedPriceProps) {
    const formatted =
        variant === 'amount'
            ? formatAmount(value, currency)
            : formatPrice(value, currency)

    return <span className={className}>{formatted}</span>
}
