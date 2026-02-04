import axios from 'axios'
import { Invoice, InvoiceStatus, PaymentProvider } from '@fluxo/types'
import { InvoiceWithOwner } from '@/components/admin/invoices/invoice-table'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export interface InvoiceFilters {
    page?: number
    limit?: number
    search?: string
    status?: InvoiceStatus
    userId?: string
}

export interface FetchInvoicesResponse {
    success: boolean
    message: string
    invoices: InvoiceWithOwner[]
    total: number
    page: number
    totalPages: number
}

export interface InvoiceResponse {
    success: boolean
    message: string
    invoice: Invoice
}

export interface DeleteResponse {
    success: boolean
    message: string
}

export interface InvoiceItem {
    name: string
    quantity: number
    unitPrice: number
    total: number
}

export interface CreateInvoiceData {
    userId: string
    serviceId?: string
    transactionId?: string
    items: InvoiceItem[]
    status?: InvoiceStatus
    amount: number
    currency?: string
    metadata?: Record<string, string | number | boolean>
    paymentProvider?: PaymentProvider
    expiresAt: Date | string
}

export interface UpdateInvoiceData {
    userId?: string
    serviceId?: string
    transactionId?: string
    items?: InvoiceItem[]
    status?: InvoiceStatus
    amount?: number
    currency?: string
    metadata?: Record<string, string | number | boolean>
    paymentProvider?: PaymentProvider
    expiresAt?: Date | string
    paidAt?: Date | string
    expiredAt?: Date | string
}

export async function fetchInvoices(
    params: InvoiceFilters = {}
): Promise<FetchInvoicesResponse> {
    try {
        const queryParams = new URLSearchParams()

        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        if (params.status) queryParams.append('status', params.status)
        if (params.userId) queryParams.append('userId', params.userId)

        const response = await axios.get(
            `${API_URL}/admin/invoices?${queryParams.toString()}`,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error) {
        console.error('Failed to fetch invoices:', error)
        return {
            success: false,
            message: 'Failed to fetch invoices',
            invoices: [],
            total: 0,
            page: 1,
            totalPages: 0,
        }
    }
}

export async function fetchInvoiceById(
    invoiceId: string
): Promise<Invoice | null> {
    try {
        const response = await axios.get(
            `${API_URL}/admin/invoices/id/${invoiceId}`,
            {
                withCredentials: true,
            }
        )

        return response.data.invoice
    } catch (error) {
        console.error('Failed to fetch invoice:', error)
        return null
    }
}

export async function fetchInvoiceByTransactionId(
    transactionId: string
): Promise<Invoice | null> {
    try {
        const response = await axios.get(
            `${API_URL}/admin/invoices/transaction/${transactionId}`,
            {
                withCredentials: true,
            }
        )

        return response.data.invoice
    } catch (error) {
        console.error('Failed to fetch invoice by transaction ID:', error)
        return null
    }
}

export async function createInvoice(
    data: CreateInvoiceData
): Promise<InvoiceResponse> {
    try {
        const response = await axios.post(`${API_URL}/admin/invoices`, data, {
            withCredentials: true,
        })

        return response.data
    } catch (error: unknown) {
        console.error('Failed to create invoice:', error)
        throw error
    }
}

export async function updateInvoice(
    invoiceId: string,
    data: UpdateInvoiceData
): Promise<InvoiceResponse> {
    try {
        const response = await axios.put(
            `${API_URL}/admin/invoices/${invoiceId}`,
            data,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to update invoice:', error)
        throw error
    }
}

export async function deleteInvoice(
    invoiceId: string
): Promise<DeleteResponse> {
    try {
        const response = await axios.delete(
            `${API_URL}/admin/invoices/${invoiceId}`,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to delete invoice:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to delete invoice',
        }
    }
}

export async function downloadInvoicePDF(invoiceId: string): Promise<void> {
    try {
        const response = await axios.get(
            `${API_URL}/admin/invoices/${invoiceId}/download`,
            {
                withCredentials: true,
                responseType: 'blob',
            }
        )

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `invoice-${invoiceId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Failed to download invoice PDF:', error)
        throw error
    }
}
