'use client'

import React, { useEffect, useState } from 'react'
import { Category } from '@fluxo/types'
import { fetchCategories } from '@/lib/admin/categories'
import InputLabel from '@/components/ui/input/input-label'
import InputError from '@/components/ui/input/input-error'

interface CategorySelectorProps {
    value: string | null | undefined
    onChange: (value: string | null) => void
    error?: string
}

export default function CategorySelector({
    value,
    onChange,
    error,
}: CategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories()
                setCategories(data)
            } catch (error) {
                console.error('Failed to load categories:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadCategories()
    }, [])

    return (
        <div>
            <InputLabel htmlFor="category">Category</InputLabel>
            <select
                id="category"
                value={value || ''}
                onChange={(e) => {
                    const val = e.target.value
                    onChange(val === '' ? null : val)
                }}
                disabled={isLoading}
                className={`w-full rounded-md border bg-neutral-900/50 px-3 py-2 text-white transition-colors duration-200 focus:ring-2 focus:outline-none ${
                    error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'focus:border-primary-300 focus:ring-primary-300 border-zinc-800'
                }`}
            >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                    <option key={category.uuid} value={category.uuid}>
                        {category.name}
                    </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
                Select a category to organize this product
            </p>
            <InputError message={error} />
        </div>
    )
}
