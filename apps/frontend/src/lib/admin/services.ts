import axios from 'axios'
import { Service, ServiceStatus } from '@fluxo/types'
import { ServiceWithOwner } from '@/components/admin/services/service-table'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

interface PaginationParams {
    page?: number
    limit?: number
    search?: string
    status?: ServiceStatus
    ownerId?: string
}

interface PaginatedResponse {
    success: boolean
    message: string
    services: ServiceWithOwner[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

interface ServiceResponse {
    success: boolean
    message: string
    service: Service
}

interface DeleteResponse {
    success: boolean
    message: string
}

export async function fetchServices(
    params: PaginationParams = {}
): Promise<PaginatedResponse> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.status) queryParams.append('status', params.status)
    if (params.ownerId) queryParams.append('ownerId', params.ownerId)

    const response = await axios.get(
        `${API_URL}/admin/services?${queryParams.toString()}`,
        {
            withCredentials: true,
        }
    )

    return response.data
}

export async function fetchServiceById(id: string): Promise<Service> {
    const response = await axios.get(`${API_URL}/admin/services/id/${id}`, {
        withCredentials: true,
    })

    return response.data.service
}

export async function createService(
    serviceData: Partial<Service>
): Promise<ServiceResponse> {
    const response = await axios.post(
        `${API_URL}/admin/services`,
        serviceData,
        {
            withCredentials: true,
        }
    )

    return response.data
}

export async function updateService(
    id: string,
    updates: Partial<Service>
): Promise<ServiceResponse> {
    try {
        const response = await axios.patch(
            `${API_URL}/admin/services/${id}`,
            { updates },
            { withCredentials: true }
        )

        return response.data
    } catch (error: unknown) {
        if (
            error &&
            typeof error === 'object' &&
            'response' in error &&
            (error.response as { data?: { message?: string } })?.data
                ?.message ===
                'No changes detected. Please modify at least one field.'
        ) {
            throw new Error('NO_CHANGES')
        }
        throw error
    }
}

export async function deleteService(id: string): Promise<DeleteResponse> {
    const response = await axios.delete(`${API_URL}/admin/services/${id}`, {
        withCredentials: true,
    })

    return response.data
}
