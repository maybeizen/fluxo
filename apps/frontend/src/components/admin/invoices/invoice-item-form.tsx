'use client'

import React, { useState } from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Button from '@/components/ui/button'
import { InvoiceItem } from '@fluxo/types'

interface InvoiceItemFormProps {
    item: InvoiceItem
    index: number
    onChange: (index: number, item: InvoiceItem) => void
    onRemove: (index: number) => void
    error?: string
}

export default function InvoiceItemForm({
    item,
    index,
    onChange,
    onRemove,
    error,
}: InvoiceItemFormProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    const handleChange = (field: keyof InvoiceItem, value: string | number) => {
        const updatedItem = { ...item, [field]: value }

        if (field === 'quantity' || field === 'unitPrice') {
            const quantity =
                field === 'quantity' ? Number(value) : item.quantity
            const unitPrice =
                field === 'unitPrice' ? Number(value) : item.unitPrice
            updatedItem.total = Math.round(quantity * unitPrice * 100) / 100
        }

        onChange(index, updatedItem)
    }

    const displayName = item.name || `Item ${index + 1}`
    const displayTotal = `$${item.total.toFixed(2)}`

    return (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
            <div className="flex w-full items-center justify-between p-4 transition-colors hover:bg-zinc-900/50">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex flex-1 items-center gap-3 text-left"
                >
                    <i
                        className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs text-zinc-400 transition-transform duration-200`}
                    />
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">
                            {displayName}
                        </h4>
                        {!isExpanded && (
                            <p className="mt-1 text-xs text-zinc-400">
                                Qty: {item.quantity} × $
                                {item.unitPrice.toFixed(2)} = {displayTotal}
                            </p>
                        )}
                    </div>
                </button>
                <div className="flex items-center gap-2">
                    {!isExpanded && (
                        <span className="text-sm font-medium text-white">
                            {displayTotal}
                        </span>
                    )}
                    <Button
                        type="button"
                        variant="fail"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="px-3"
                    >
                        <i className="fas fa-trash"></i>
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-4 border-t border-zinc-800 p-4 pt-0">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <InputLabel htmlFor={`item-name-${index}`} required>
                                Item Name
                            </InputLabel>
                            <Input
                                id={`item-name-${index}`}
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                    handleChange('name', e.target.value)
                                }
                                placeholder="Service subscription"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor={`item-quantity-${index}`}
                                required
                            >
                                Quantity
                            </InputLabel>
                            <Input
                                id={`item-quantity-${index}`}
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={(e) =>
                                    handleChange(
                                        'quantity',
                                        parseInt(e.target.value) || 1
                                    )
                                }
                                required
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor={`item-unit-price-${index}`}
                                required
                            >
                                Unit Price ($)
                            </InputLabel>
                            <Input
                                id={`item-unit-price-${index}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                    handleChange(
                                        'unitPrice',
                                        parseFloat(e.target.value) || 0
                                    )
                                }
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor={`item-total-${index}`}>
                                Total ($)
                            </InputLabel>
                            <Input
                                id={`item-total-${index}`}
                                type="number"
                                value={item.total.toFixed(2)}
                                disabled
                                className="bg-zinc-900"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
            )}
        </div>
    )
}
