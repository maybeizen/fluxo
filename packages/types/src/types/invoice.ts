export enum InvoiceStatus {
    PENDING = 'pending',
    PAID = 'paid',
    EXPIRED = 'expired',
}

export interface InvoiceTimestamps {
    createdAt: Date
    updatedAt: Date
    paidAt?: Date
    expiresAt: Date
    expiredAt?: Date
}

export interface InvoiceItem {
    name: string
    quantity: number
    unitPrice: number
    total: number
}

export enum PaymentProvider {
    STRIPE = 'stripe',
    ACCOUNT_BALANCE = 'account_balance',
}

export interface InvoiceCoupon {
    code: string
    type: string
    value: number
}

export interface Invoice {
    uuid: string
    userId: string
    serviceId?: string
    transactionId?: string
    items: InvoiceItem[]
    status: InvoiceStatus
    amount: number
    currency: string
    metadata?: Record<string, string | number | boolean>
    paymentProvider?: PaymentProvider
    coupon?: InvoiceCoupon
    timestamps: InvoiceTimestamps
}
