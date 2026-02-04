import axios from 'axios'
import { Invoice, InvoiceStatus } from '@fluxo/types'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export interface InvoiceFilters {
    page?: number
    limit?: number
    status?: InvoiceStatus
}

export interface FetchInvoicesResponse {
    success: boolean
    message: string
    invoices: Invoice[]
    total: number
    page: number
    totalPages: number
}

export interface InvoiceResponse {
    success: boolean
    message: string
    invoice: Invoice
}

export async function fetchMyInvoices(
    params: InvoiceFilters = {}
): Promise<FetchInvoicesResponse> {
    try {
        const queryParams = new URLSearchParams()

        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.status) queryParams.append('status', params.status)

        const response = await axios.get(
            `${API_URL}/client/invoices?${queryParams.toString()}`,
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

export async function fetchMyInvoiceById(
    invoiceId: string
): Promise<Invoice | null> {
    try {
        const response = await axios.get(
            `${API_URL}/client/invoices/${invoiceId}`,
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

export interface CheckoutInvoiceData {
    items: Array<{
        name: string
        quantity: number
        unitPrice: number
        total: number
    }>
    amount: number
    currency?: string
    paymentProvider?: string
    gatewayPluginId?: string
    transactionId?: string
    serviceId?: string
    metadata?: Record<string, string | number | boolean>
    expiresAt: Date | string
    returnUrl?: string
    cancelUrl?: string
}

export interface CheckoutInvoiceResponse extends InvoiceResponse {
    payment?: {
        redirectUrl?: string
        clientSecret?: string
        transactionId?: string
        completed?: boolean
    }
}

export async function createInvoiceFromCheckout(
    data: CheckoutInvoiceData
): Promise<CheckoutInvoiceResponse> {
    try {
        const response = await axios.post(
            `${API_URL}/client/invoices/checkout`,
            data,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to create invoice from checkout:', error)
        throw error
    }
}

export async function downloadInvoicePDF(invoiceId: string): Promise<void> {
    try {
        const response = await axios.get(
            `${API_URL}/client/invoices/${invoiceId}/download`,
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

export async function applyCouponToInvoice(
    invoiceId: string,
    couponCode: string
): Promise<InvoiceResponse> {
    try {
        const response = await axios.post(
            `${API_URL}/client/invoices/${invoiceId}/apply-coupon`,
            { code: couponCode },
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to apply coupon:', error)
        throw error
    }
}

export async function removeCouponFromInvoice(
    invoiceId: string
): Promise<InvoiceResponse> {
    try {
        const response = await axios.delete(
            `${API_URL}/client/invoices/${invoiceId}/coupon`,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to remove coupon:', error)
        throw error
    }
}
