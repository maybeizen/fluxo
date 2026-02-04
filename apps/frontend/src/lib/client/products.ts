import axios from 'axios'
import { Product } from '@fluxo/types'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

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
        const response = await axios.get(
            `${API_URL}/client/products?limit=1000`,
            {
                withCredentials: true,
            }
        )

        return response.data.products || []
    } catch (error) {
        console.error('Failed to fetch products:', error)
        return []
    }
}
