import { apiClient } from '@/lib/api-client'
import { type Service, type News } from '@fluxo/types'

export type { Service, News }

export interface Invoice {
    uuid: string
    amount: number
    currency: string
    status: string
    items: Array<{
        name: string
        quantity: number
        unitPrice: number
        total: number
    }>
    timestamps: {
        createdAt: Date | string
        expiresAt: Date | string
    }
}

export async function fetchServices(): Promise<Service[]> {
    try {
        const response = await apiClient.get(`/client/services`, {})
        return response.data.services || []
    } catch (error) {
        console.error('Failed to fetch services:', error)
        return []
    }
}

export async function fetchServiceById(id: string): Promise<Service> {
    const response = await apiClient.get(`/client/services/${id}`, {})
    return response.data.service
}

export async function updateServiceName(
    id: string,
    serviceName: string
): Promise<Service> {
    const response = await apiClient.put(`/client/services/${id}`, {
        serviceName,
    })
    return response.data.service
}

export async function cancelService(
    id: string,
    cancellationReason: string
): Promise<Service> {
    const response = await apiClient.post(`/client/services/${id}/cancel`, {
        cancellationReason,
    })
    return response.data.service
}

export async function fetchInvoices(): Promise<Invoice[]> {
    try {
        const response = await apiClient.get(`/client/invoices?limit=10`, {
            withCredentials: true,
        })
        return response.data.invoices || []
    } catch (error) {
        console.error('Failed to fetch invoices:', error)
        return []
    }
}

export async function fetchNews(): Promise<News[]> {
    try {
        const response = await apiClient.get(`/news?limit=6`, {})
        return response.data.news || []
    } catch (error) {
        console.error('Failed to fetch news:', error)
        return []
    }
}
