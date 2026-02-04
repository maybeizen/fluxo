'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@fluxo/types'
import ProductTable from '@/components/admin/products/product-table'
import ProductFiltersComponent, {
    ProductFilters,
} from '@/components/admin/products/product-filters'
import Button from '@/components/ui/button'
import Pagination from '@/components/admin/pagination'
import { useNotifications } from '@/context/notification-context'
import {
    fetchProducts,
    deleteProduct,
    reorderProducts,
} from '@/lib/admin/products'
import { parseApiError } from '@/utils/parse-api-error'

export default function ProductsPage() {
    const router = useRouter()
    const notifications = useNotifications()

    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    const [filters, setFilters] = useState<ProductFilters>({
        search: '',
        includeHidden: false,
    })

    const itemsPerPage = 10

    useEffect(() => {
        loadProducts()
    }, [currentPage, filters])

    const loadProducts = async () => {
        setIsLoading(true)
        try {
            const data = await fetchProducts({
                page: currentPage,
                limit: itemsPerPage,
                search: filters.search || undefined,
                includeHidden: filters.includeHidden,
            })

            if (data.success) {
                setProducts(data.products)
                setTotal(data.total)
                setTotalPages(data.totalPages)
            } else {
                notifications.error(data.message || 'Failed to fetch products')
            }
        } catch (error) {
            const errorMessage = parseApiError(error)
            notifications.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (productId: string) => {
        try {
            const response = await deleteProduct(productId)

            if (response.success) {
                notifications.success('Product deleted successfully')
                loadProducts()
            } else {
                notifications.error(
                    response.message || 'Failed to delete product'
                )
            }
        } catch (error) {
            const errorMessage = parseApiError(error)
            notifications.error(errorMessage)
        }
    }

    const handleFilterChange = (newFilters: ProductFilters) => {
        setFilters(newFilters)
        setCurrentPage(1)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleNewProduct = () => {
        router.push('/admin/products/new')
    }

    const handleReorder = async (
        orderUpdates: Array<{ uuid: string; order: number }>
    ) => {
        try {
            const result = await reorderProducts({ products: orderUpdates })

            if (result.success) {
                notifications.success('Products reordered successfully')
                loadProducts()
            } else {
                notifications.error(
                    result.message || 'Failed to reorder products'
                )
            }
        } catch (error) {
            const errorMessage = parseApiError(error)
            notifications.error(errorMessage)
        }
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Product Management
                            </h1>
                            <p className="text-zinc-400">
                                Manage your hosting products and plans. Total:{' '}
                                {total} products
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleNewProduct}
                                icon="fas fa-plus"
                            >
                                New Product
                            </Button>
                        </div>
                    </div>

                    <ProductFiltersComponent
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
                    <ProductTable
                        products={products}
                        onDelete={handleDelete}
                        onReorder={handleReorder}
                        isLoading={isLoading}
                    />
                </div>

                {totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
