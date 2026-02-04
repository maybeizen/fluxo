'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@fluxo/types'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'

interface ProductTableProps {
    products: Product[]
    onDelete: (productId: string) => void
    onReorder?: (products: Array<{ uuid: string; order: number }>) => void
    isLoading?: boolean
    className?: string
}

export default function ProductTable({
    products,
    onDelete,
    onReorder,
    isLoading = false,
    className = '',
}: ProductTableProps) {
    const router = useRouter()
    const notifications = useNotifications()
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(
        null
    )

    const handleEdit = (productId: string) => {
        router.push(`/admin/products/${productId}/edit`)
    }

    const handleDelete = async (product: Product) => {
        if (
            window.confirm(
                `Are you sure you want to delete "${product.metadata.name}"? This action cannot be undone.`
            )
        ) {
            onDelete(product.uuid)
        }
    }

    const handleCopyId = async (uuid: string) => {
        try {
            await navigator.clipboard.writeText(uuid)
            notifications.success('Product ID copied to clipboard')
        } catch (error) {
            console.error('Failed to copy ID:', error)
            notifications.error('Failed to copy ID')
        }
    }

    const formatPrice = (price: number) => {
        return `$${(price / 100).toFixed(2)}`
    }

    const formatIntegration = (product: Product) => {
        const integrations = product.integrations
        if (!integrations) {
            return (
                <span className="text-xs text-zinc-500">
                    <i className="fas fa-plug mr-1"></i>
                    None
                </span>
            )
        }

        if (integrations.servicePluginId) {
            const pluginName =
                integrations.servicePluginId.charAt(0).toUpperCase() +
                integrations.servicePluginId.slice(1)
            return (
                <span className="text-xs text-zinc-300">
                    <i className="fas fa-plug mr-1"></i>
                    {pluginName}
                </span>
            )
        }

        if (integrations.pterodactyl) {
            return (
                <span className="text-xs text-zinc-300">
                    <i className="fas fa-server mr-1"></i>
                    Pterodactyl
                </span>
            )
        }

        return (
            <span className="text-xs text-zinc-500">
                <i className="fas fa-plug mr-1"></i>
                None
            </span>
        )
    }

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        setDraggedOverIndex(index)
    }

    const handleDragLeave = () => {
        setDraggedOverIndex(null)
    }

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        setDraggedOverIndex(null)

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null)
            return
        }

        if (!onReorder) {
            setDraggedIndex(null)
            return
        }

        const reorderedProducts = [...products]
        const [draggedProduct] = reorderedProducts.splice(draggedIndex, 1)
        reorderedProducts.splice(dropIndex, 0, draggedProduct)

        const orderUpdates = reorderedProducts.map((product, index) => ({
            uuid: product.uuid,
            order: index,
        }))

        onReorder(orderUpdates)
        setDraggedIndex(null)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
        setDraggedOverIndex(null)
    }

    const getStatusBadges = (product: Product) => {
        const badges = []

        if (product.status.hidden) {
            badges.push(
                <span
                    key="hidden"
                    className="rounded border border-zinc-500/20 bg-zinc-500/10 px-2 py-1 text-xs font-medium text-zinc-400"
                >
                    <i className="fas fa-eye-slash mr-1"></i>
                    Hidden
                </span>
            )
        }

        if (product.status.disabled) {
            badges.push(
                <span
                    key="disabled"
                    className="border-primary-400/20 bg-primary-400/10 text-primary-400 rounded border px-2 py-1 text-xs font-medium"
                >
                    <i className="fas fa-ban mr-1"></i>
                    Disabled
                </span>
            )
        }

        if (!product.status.hidden && !product.status.disabled) {
            badges.push(
                <span
                    key="active"
                    className="rounded border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500"
                >
                    <i className="fas fa-check mr-1"></i>
                    Active
                </span>
            )
        }

        return badges
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                    <i className="fas fa-box text-2xl text-zinc-600"></i>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                    No Products Found
                </h3>
                <p className="max-w-md text-sm text-zinc-400">
                    No products match your current filters. Try adjusting your
                    search criteria.
                </p>
            </div>
        )
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-zinc-800">
                        {onReorder && (
                            <th className="w-12 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                <i className="fas fa-grip-vertical"></i>
                            </th>
                        )}
                        <th className="w-24 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Product
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Price
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Integration
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Stock
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Status
                        </th>
                        <th className="w-32 px-4 py-3 text-right text-sm font-medium text-zinc-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => {
                        const stock = product.stock.stock ?? 0
                        const isLowStock =
                            product.stock.stockEnabled && stock < 5

                        return (
                            <tr
                                key={product.uuid || `product-${index}`}
                                draggable={!!onReorder}
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`border-b border-zinc-900 transition-colors ${
                                    draggedIndex === index
                                        ? 'opacity-50'
                                        : draggedOverIndex === index
                                          ? 'bg-primary-900/20 border-primary-500'
                                          : 'hover:bg-zinc-900/50'
                                }`}
                            >
                                {onReorder && (
                                    <td className="px-4 py-3">
                                        <div
                                            className="cursor-move text-zinc-500 hover:text-zinc-300"
                                            title="Drag to reorder"
                                        >
                                            <i className="fas fa-grip-vertical"></i>
                                        </div>
                                    </td>
                                )}
                                <td className="px-4 py-3">
                                    <div
                                        className="group flex w-fit cursor-pointer items-center gap-2 transition-colors hover:text-white"
                                        onClick={() =>
                                            handleCopyId(product.uuid)
                                        }
                                        title="Click to copy ID"
                                    >
                                        <span className="font-mono text-xs text-zinc-400 group-hover:text-white">
                                            {product.uuid}
                                        </span>
                                        <i className="fas fa-copy flex-shrink-0 text-xs text-zinc-600 group-hover:text-zinc-400"></i>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white">
                                            {product.metadata.name}
                                        </span>
                                        <span className="mt-0.5 max-w-xs truncate text-xs text-zinc-500">
                                            {product.metadata.description}
                                        </span>
                                        {product.metadata.tags &&
                                            product.metadata.tags.length >
                                                0 && (
                                                <div className="mt-1 flex gap-1">
                                                    {product.metadata.tags
                                                        .slice(0, 2)
                                                        .map((tag, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    {product.metadata.tags
                                                        .length > 2 && (
                                                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                                                            +
                                                            {product.metadata
                                                                .tags.length -
                                                                2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm font-medium text-white">
                                        {formatPrice(product.metadata.price)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {formatIntegration(product)}
                                </td>
                                <td className="px-4 py-3">
                                    {!product.stock.stockEnabled ? (
                                        <span className="text-sm text-zinc-400">
                                            Unlimited
                                        </span>
                                    ) : (
                                        <span
                                            className={`text-sm font-medium ${
                                                isLowStock
                                                    ? 'text-yellow-400'
                                                    : 'text-zinc-300'
                                            }`}
                                        >
                                            {stock}{' '}
                                            {isLowStock && (
                                                <i className="fas fa-exclamation-triangle ml-1"></i>
                                            )}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {getStatusBadges(product)}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleEdit(product.uuid)
                                            }
                                            className="px-3"
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                            variant="fail"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(product)
                                            }
                                            className="px-3"
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
