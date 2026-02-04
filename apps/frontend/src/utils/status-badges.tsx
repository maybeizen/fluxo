import React from 'react'
import {
    ServiceStatus,
    InvoiceStatus,
    TicketStatus,
    PaymentProvider,
} from '@fluxo/types'

const serviceStatusConfig: Record<
    ServiceStatus,
    { label: string; className: string; icon: string }
> = {
    [ServiceStatus.ACTIVE]: {
        label: 'Active',
        className: 'bg-green-500/20 text-green-400 border-green-500/50',
        icon: 'fa-circle-check',
    },
    [ServiceStatus.SUSPENDED]: {
        label: 'Suspended',
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        icon: 'fa-pause-circle',
    },
    [ServiceStatus.CANCELLED]: {
        label: 'Cancelled',
        className: 'bg-red-500/20 text-red-400 border-red-500/50',
        icon: 'fa-circle-xmark',
    },
    [ServiceStatus.DELETED]: {
        label: 'Deleted',
        className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50',
        icon: 'fa-trash',
    },
}

const invoiceStatusConfig: Record<InvoiceStatus, { className: string }> = {
    [InvoiceStatus.PENDING]: {
        className: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    },
    [InvoiceStatus.PAID]: {
        className: 'bg-green-500/20 text-green-400 border-green-500/50',
    },
    [InvoiceStatus.EXPIRED]: {
        className: 'bg-red-500/20 text-red-400 border-red-500/50',
    },
}

const ticketStatusConfig: Record<
    TicketStatus,
    { label: string; className: string; icon: string }
> = {
    [TicketStatus.OPEN]: {
        label: 'Open',
        className: 'bg-green-500/20 text-green-400 border-green-500/50',
        icon: 'fa-circle-check',
    },
    [TicketStatus.CLOSED]: {
        label: 'Closed',
        className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50',
        icon: 'fa-circle-xmark',
    },
    [TicketStatus.DELETED]: {
        label: 'Deleted',
        className: 'bg-red-500/20 text-red-400 border-red-500/50',
        icon: 'fa-trash',
    },
}

const paymentProviderConfig: Record<
    PaymentProvider,
    { label: string; className: string; icon: string }
> = {
    [PaymentProvider.STRIPE]: {
        label: 'Stripe',
        className: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        icon: 'fa-credit-card',
    },
    [PaymentProvider.ACCOUNT_BALANCE]: {
        label: 'Account Balance',
        className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        icon: 'fa-wallet',
    },
}

interface ServiceStatusBadgeProps {
    status: ServiceStatus
    size?: 'sm' | 'md' | 'lg'
    showIcon?: boolean
    className?: string
}

export function ServiceStatusBadge({
    status,
    size = 'md',
    showIcon = true,
    className = '',
}: ServiceStatusBadgeProps) {
    const config = serviceStatusConfig[status]
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    }

    return (
        <div
            className={`flex items-center gap-1.5 rounded-md border font-medium ${config.className} ${sizeClasses[size]} ${className}`}
        >
            {showIcon && <i className={`fas ${config.icon} text-xs`}></i>}
            {config.label}
        </div>
    )
}

interface InvoiceStatusBadgeProps {
    status: InvoiceStatus
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function InvoiceStatusBadge({
    status,
    size = 'md',
    className = '',
}: InvoiceStatusBadgeProps) {
    const config = invoiceStatusConfig[status]
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    }

    return (
        <span
            className={`rounded-md border font-medium ${config.className} ${sizeClasses[size]} ${className}`}
        >
            {status.toUpperCase()}
        </span>
    )
}

export function getServiceStatusBadgeClassName(status: ServiceStatus): string {
    return serviceStatusConfig[status].className
}

export function getInvoiceStatusBadgeClassName(status: InvoiceStatus): string {
    return invoiceStatusConfig[status].className
}

interface TicketStatusBadgeProps {
    status: TicketStatus
    size?: 'sm' | 'md' | 'lg'
    showIcon?: boolean
    className?: string
}

export function TicketStatusBadge({
    status,
    size = 'md',
    showIcon = true,
    className = '',
}: TicketStatusBadgeProps) {
    const config = ticketStatusConfig[status]
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${config.className} ${sizeClasses[size]} ${className}`}
        >
            {showIcon && <i className={`fas ${config.icon} text-xs`}></i>}
            {config.label}
        </span>
    )
}

interface PaymentProviderBadgeProps {
    provider: PaymentProvider
    size?: 'sm' | 'md' | 'lg'
    showIcon?: boolean
    className?: string
}

export function PaymentProviderBadge({
    provider,
    size = 'md',
    showIcon = true,
    className = '',
}: PaymentProviderBadgeProps) {
    const config = paymentProviderConfig[provider]
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded border font-medium ${config.className} ${sizeClasses[size]} ${className}`}
        >
            {showIcon && <i className={`fas ${config.icon} text-xs`}></i>}
            {config.label}
        </span>
    )
}

export function getTicketStatusBadgeClassName(status: TicketStatus): string {
    return ticketStatusConfig[status].className
}

export function getPaymentProviderBadgeClassName(
    provider: PaymentProvider
): string {
    return paymentProviderConfig[provider].className
}
