'use client'

import React, { useState, useEffect } from 'react'
import { Product } from '@fluxo/types'
import { fetchProducts } from '@/lib/admin/products'
import SelectMenu from './select-menu'
import InputError from './input-error'
import Spinner from '../spinner'

interface ProductSelectProps {
    value: string
    onChange: (productId: string) => void
    error?: string
    className?: string
    required?: boolean
    includeHidden?: boolean
}

export default function ProductSelect({
    value,
    onChange,
    error,
    className = '',
    required = false,
    includeHidden = false,
}: ProductSelectProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true)
            try {
                const response = await fetchProducts({
                    limit: 1000,
                    includeHidden,
                })
                setProducts(response.products || [])
            } catch (error) {
                console.error('Error loading products:', error)
                setProducts([])
            } finally {
                setIsLoading(false)
            }
        }

        loadProducts()
    }, [includeHidden])

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value)
    }

    if (isLoading) {
        return (
            <div className={className}>
                <div className="flex w-full items-center justify-center rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2">
                    <Spinner />
                </div>
                <InputError message={error} />
            </div>
        )
    }

    const options =
        products.length > 0
            ? products.map((product) => ({
                  value: product.uuid,
                  label:
                      product.metadata?.name ||
                      `Product ${product.uuid.slice(0, 8)}`,
              }))
            : [{ value: '', label: 'No Products Found', disabled: true }]

    return (
        <div className={className}>
            <SelectMenu
                value={value}
                onChange={handleChange}
                options={options}
                error={error}
                required={required}
                placeholder="Select a product..."
            />
        </div>
    )
}
