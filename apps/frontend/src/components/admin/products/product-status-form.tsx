'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Checkbox from '@/components/ui/input/checkbox'

interface ProductStatusFormProps {
    hidden: boolean
    setHidden: (value: boolean) => void
    disabled: boolean
    setDisabled: (value: boolean) => void
    allowCoupons: boolean
    setAllowCoupons: (value: boolean) => void
    stockEnabled: boolean
    setStockEnabled: (value: boolean) => void
    stock: number | null
    setStock: (value: number | null) => void
    errors: Record<string, string>
    validateField?: (
        field:
            | 'hidden'
            | 'disabled'
            | 'allowCoupons'
            | 'stockEnabled'
            | 'stock',
        value: unknown
    ) => boolean
}

export default function ProductStatusForm({
    hidden,
    setHidden,
    disabled,
    setDisabled,
    allowCoupons,
    setAllowCoupons,
    stockEnabled,
    setStockEnabled,
    stock,
    setStock,
    errors,
    validateField,
}: ProductStatusFormProps) {
    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                Status & Availability
            </h2>

            <div className="space-y-4">
                <Checkbox
                    id="hidden"
                    label="Hidden from public catalog"
                    checked={hidden}
                    onChange={(e) => setHidden(e.target.checked)}
                />

                <Checkbox
                    id="disabled"
                    label="Disabled (cannot be purchased)"
                    checked={disabled}
                    onChange={(e) => setDisabled(e.target.checked)}
                />

                <Checkbox
                    id="allowCoupons"
                    label="Allow coupon discounts"
                    checked={allowCoupons}
                    onChange={(e) => setAllowCoupons(e.target.checked)}
                />

                <div className="border-t border-zinc-900 pt-4">
                    <Checkbox
                        id="stockEnabled"
                        label="Enable stock tracking"
                        checked={stockEnabled}
                        onChange={(e) => setStockEnabled(e.target.checked)}
                    />

                    {stockEnabled && (
                        <div className="mt-4 ml-6">
                            <InputLabel htmlFor="stock">
                                Stock Quantity
                            </InputLabel>
                            <Input
                                id="stock"
                                type="number"
                                step="1"
                                value={stock ?? ''}
                                onChange={(e) =>
                                    setStock(
                                        e.target.value
                                            ? parseInt(e.target.value)
                                            : null
                                    )
                                }
                                onBlur={() => validateField?.('stock', stock)}
                                placeholder="10"
                                min="0"
                            />
                            <p className="mt-1 text-xs text-zinc-500">
                                Available units for purchase
                            </p>
                            {errors.stock && (
                                <p className="text-primary-400 mt-1 text-xs">
                                    <i className="fas fa-exclamation-circle mr-1"></i>
                                    {errors.stock}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
