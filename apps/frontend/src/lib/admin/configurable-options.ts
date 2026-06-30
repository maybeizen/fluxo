import { apiClient } from '@/lib/api-client'
import type {
    ConfigurableOption,
    ConfigurableOptionInputType,
    ConfigurableOptionPricingType,
} from '@fluxo/types'

export interface ConfigurableOptionFilters {
    page?: number
    limit?: number
    search?: string
    pluginId?: string
    productId?: number
}

export interface FetchConfigurableOptionsResponse {
    success: boolean
    message: string
    configurableOptions: ConfigurableOption[]
    total: number
    page: number
    totalPages: number
}

export interface ConfigurableOptionResponse {
    success: boolean
    message: string
    configurableOption: ConfigurableOption
}

export interface DeleteResponse {
    success: boolean
    message: string
}

export interface ConfigurableOptionScopeInput {
    productId: number | null
    defaultValue?: unknown
}

export interface ConfigurableOptionPricingInput {
    pricingType: ConfigurableOptionPricingType
    amount: number
    useMultiplier: boolean
}

export interface CreateConfigurableOptionData {
    pluginId: string
    fieldKey: string
    label?: string
    type?: ConfigurableOptionInputType | null
    defaultValue?: unknown
    order?: number
    scopes?: ConfigurableOptionScopeInput[]
    pricing?: ConfigurableOptionPricingInput
}

export interface UpdateConfigurableOptionData {
    pluginId?: string
    fieldKey?: string
    label?: string | null
    type?: ConfigurableOptionInputType | null
    defaultValue?: unknown
    order?: number
    scopes?: ConfigurableOptionScopeInput[]
    pricing?: ConfigurableOptionPricingInput | null
}

export async function fetchConfigurableOptions(
    params: ConfigurableOptionFilters = {}
): Promise<FetchConfigurableOptionsResponse> {
    try {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        if (params.pluginId) queryParams.append('pluginId', params.pluginId)
        if (params.productId != null) {
            queryParams.append('productId', params.productId.toString())
        }

        const response = await apiClient.get(
            `/admin/configurable-options?${queryParams.toString()}`
        )
        return response.data
    } catch (error) {
        console.error('Failed to fetch configurable options:', error)
        return {
            success: false,
            message: 'Failed to fetch configurable options',
            configurableOptions: [],
            total: 0,
            page: 1,
            totalPages: 0,
        }
    }
}

export async function fetchConfigurableOptionById(
    id: string
): Promise<ConfigurableOption | null> {
    try {
        const response = await apiClient.get(
            `/admin/configurable-options/id/${id}`
        )
        return response.data.configurableOption
    } catch (error) {
        console.error('Failed to fetch configurable option:', error)
        return null
    }
}

export async function createConfigurableOption(
    data: CreateConfigurableOptionData
): Promise<ConfigurableOptionResponse> {
    const response = await apiClient.post('/admin/configurable-options', data)
    return response.data
}

export async function updateConfigurableOption(
    id: string,
    data: UpdateConfigurableOptionData
): Promise<ConfigurableOptionResponse> {
    const response = await apiClient.put(
        `/admin/configurable-options/${id}`,
        data
    )
    return response.data
}

export async function deleteConfigurableOption(
    id: string
): Promise<DeleteResponse> {
    try {
        const response = await apiClient.delete(
            `/admin/configurable-options/${id}`
        )
        return response.data
    } catch (error: unknown) {
        console.error('Failed to delete configurable option:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to delete configurable option',
        }
    }
}
