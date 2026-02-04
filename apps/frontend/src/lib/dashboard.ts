import axios from 'axios'
import { Service, News } from '@fluxo/types'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

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
        const response = await axios.get(`${API_URL}/client/services`, {
            withCredentials: true,
        })
        return response.data.services || []
    } catch (error) {
        console.error('Failed to fetch services:', error)
        return []
    }
}

export async function fetchServiceById(id: string): Promise<Service> {
    const response = await axios.get(`${API_URL}/client/services/${id}`, {
        withCredentials: true,
    })
    return response.data.service
}

export async function updateServiceName(
    id: string,
    serviceName: string
): Promise<Service> {
    const response = await axios.put(
        `${API_URL}/client/services/${id}`,
        { serviceName },
        { withCredentials: true }
    )
    return response.data.service
}

export async function cancelService(
    id: string,
    cancellationReason: string
): Promise<Service> {
    const response = await axios.post(
        `${API_URL}/client/services/${id}/cancel`,
        { cancellationReason },
        { withCredentials: true }
    )
    return response.data.service
}

export async function fetchInvoices(): Promise<Invoice[]> {
    try {
        const response = await axios.get(
            `${API_URL}/client/invoices?limit=10`,
            {
                withCredentials: true,
            }
        )
        return response.data.invoices || []
    } catch (error) {
        console.error('Failed to fetch invoices:', error)
        return []
    }
}

export async function fetchNews(): Promise<News[]> {
    try {
        const response = await axios.get(`${API_URL}/news?limit=6`, {
            withCredentials: true,
        })
        return response.data.news || []
    } catch (error) {
        console.error('Failed to fetch news:', error)
        return []
    }
}
