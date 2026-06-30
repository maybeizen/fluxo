import { apiClient } from '@/lib/api-client'
import type { ConfigurableOptionForProduct } from '@fluxo/types'

export interface FetchOptionsForProductResponse {
    success: boolean
    message: string
    configurableOptions: ConfigurableOptionForProduct[]
}

export async function fetchOptionsForProduct(
    productId: number
): Promise<ConfigurableOptionForProduct[]> {
    try {
        const response = await apiClient.get(
            `/client/configurable-options?productId=${productId}`
        )
        return response.data.configurableOptions ?? []
    } catch (error) {
        console.error(
            'Failed to fetch configurable options for product:',
            error
        )
        return []
    }
}
