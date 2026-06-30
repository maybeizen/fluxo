import { apiClient } from '@/lib/api-client'
import { type Product } from '@fluxo/types'

export interface FetchProductsResponse {
    success: boolean
    message: string
    products: Product[]
    total: number
    page: number
    totalPages: number
}

export async function fetchProducts(): Promise<Product[]> {
    try {
        const response = await apiClient.get(`/client/products?limit=1000`, {
            withCredentials: true,
        })

        return response.data.products || []
    } catch (error) {
        console.error('Failed to fetch products:', error)
        return []
    }
}
