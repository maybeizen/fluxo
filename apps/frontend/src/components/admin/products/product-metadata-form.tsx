'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import TextArea from '@/components/ui/input/text-area'
import CategorySelector from './category-selector'

interface ProductMetadataFormProps {
    name: string
    setName: (value: string) => void
    description: string
    setDescription: (value: string) => void
    price: number
    setPrice: (value: number) => void
    tags: string
    setTags: (value: string) => void
    category: string | null | undefined
    setCategory: (value: string | null) => void
    errors: Record<string, string>
    validateField?: (
        field: 'name' | 'description' | 'price' | 'tags' | 'category',
        value: unknown
    ) => boolean
}

export default function ProductMetadataForm({
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    tags,
    setTags,
    category,
    setCategory,
    errors,
    validateField,
}: ProductMetadataFormProps) {
    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                Product Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                    <InputLabel htmlFor="name" required>
                        Product Name
                    </InputLabel>
                    <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => validateField?.('name', name)}
                        placeholder="Basic Hosting Plan"
                        required
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                        3-100 characters. {name.length}/100
                    </p>
                    {errors.name && (
                        <p className="text-primary-400 mt-1 text-xs">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <InputLabel htmlFor="description" required>
                        Description
                    </InputLabel>
                    <TextArea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={() =>
                            validateField?.('description', description)
                        }
                        placeholder="A reliable and affordable hosting solution for small projects..."
                        rows={4}
                        required
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                        10-500 characters. {description.length}/500
                    </p>
                    {errors.description && (
                        <p className="text-primary-400 mt-1 text-xs">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.description}
                        </p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="price" required>
                        Price ($)
                    </InputLabel>
                    <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) =>
                            setPrice(parseFloat(e.target.value) || 0)
                        }
                        onBlur={() => validateField?.('price', price)}
                        placeholder="9.99"
                        min="0"
                        required
                    />
                    {errors.price && (
                        <p className="text-primary-400 mt-1 text-xs">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.price}
                        </p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="tags">Tags</InputLabel>
                    <Input
                        id="tags"
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="hosting, budget, starter"
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                        Comma-separated tags for categorization
                    </p>
                    {errors.tags && (
                        <p className="mt-1 text-xs text-red-400">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.tags}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <CategorySelector
                        value={category}
                        onChange={setCategory}
                        error={errors.category}
                    />
                </div>
            </div>
        </div>
    )
}
