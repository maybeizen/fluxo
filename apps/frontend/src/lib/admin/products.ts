import axios from 'axios'
import { Product } from '@fluxo/types'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export interface ProductFilters {
    page?: number
    limit?: number
    search?: string
    includeHidden?: boolean
}

export interface FetchProductsResponse {
    success: boolean
    message: string
    products: Product[]
    total: number
    page: number
    totalPages: number
}

export interface ProductResponse {
    success: boolean
    message: string
    product: Product
}

export interface DeleteResponse {
    success: boolean
    message: string
}

export async function fetchProducts(
    params: ProductFilters = {}
): Promise<FetchProductsResponse> {
    try {
        const queryParams = new URLSearchParams()

        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        if (params.includeHidden) queryParams.append('includeHidden', 'true')

        const response = await axios.get(
            `${API_URL}/admin/products?${queryParams.toString()}`,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error) {
        console.error('Failed to fetch products:', error)
        return {
            success: false,
            message: 'Failed to fetch products',
            products: [],
            total: 0,
            page: 1,
            totalPages: 0,
        }
    }
}

export async function fetchProductById(
    productId: string
): Promise<Product | null> {
    try {
        const response = await axios.get(
            `${API_URL}/admin/products/id/${productId}`,
            {
                withCredentials: true,
            }
        )

        return response.data.product
    } catch (error) {
        console.error('Failed to fetch product:', error)
        return null
    }
}

export async function createProduct(
    data: Partial<Product>
): Promise<ProductResponse> {
    try {
        const response = await axios.post(`${API_URL}/admin/products`, data, {
            withCredentials: true,
        })

        return response.data
    } catch (error: unknown) {
        console.error('Failed to create product:', error)
        throw error
    }
}

export async function updateProduct(
    productId: string,
    updates: Partial<Product>
): Promise<ProductResponse> {
    try {
        const response = await axios.put(
            `${API_URL}/admin/products/${productId}`,
            updates,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to update product:', error)
        throw error
    }
}

export async function deleteProduct(
    productId: string
): Promise<DeleteResponse> {
    try {
        const response = await axios.delete(
            `${API_URL}/admin/products/${productId}`,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to delete product:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to delete product',
        }
    }
}

export interface ReorderProductsData {
    products: Array<{ uuid: string; order: number }>
}

export interface ReorderResponse {
    success: boolean
    message: string
}

export async function reorderProducts(
    data: ReorderProductsData
): Promise<ReorderResponse> {
    try {
        const response = await axios.post(
            `${API_URL}/admin/products/reorder`,
            data,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to reorder products:', error)
        throw error
    }
}
