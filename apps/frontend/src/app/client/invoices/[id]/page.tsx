'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Invoice, InvoiceStatus, PaymentProvider } from '@fluxo/types'
import {
    fetchMyInvoiceById,
    downloadInvoicePDF,
    applyCouponToInvoice,
    removeCouponFromInvoice,
} from '@/lib/client/invoices'
import { calculateAmountWithCoupon } from '@/utils/invoice-calculations'
import { formatAmount, formatDate, formatShortDate } from '@/utils/formatting'
import { InvoiceStatusBadge } from '@/utils/status-badges'
import { useAuth } from '@/context/auth-context'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import { useNotifications } from '@/context/notification-context'

export default function ViewInvoicePage() {
    const router = useRouter()
    const params = useParams()
    const notifications = useNotifications()
    const { user } = useAuth()
    const invoiceId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [couponCode, setCouponCode] = useState('')
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string
        type: string
        value: number
    } | null>(null)
    const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>(
        PaymentProvider.STRIPE
    )
    const [isPaying, setIsPaying] = useState(false)

    useEffect(() => {
        const loadInvoice = async () => {
            try {
                const data = await fetchMyInvoiceById(invoiceId)
                if (!data) {
                    notifications.error('Invoice not found')
                    router.push('/client/invoices')
                    return
                }
                setInvoice(data)
                if (data.coupon) {
                    setAppliedCoupon({
                        code: data.coupon.code,
                        type: data.coupon.type,
                        value: data.coupon.value,
                    })
                }
            } catch (error) {
                console.error('Error loading invoice:', error)
                notifications.error('Failed to load invoice')
                router.push('/client/invoices')
            } finally {
                setIsLoading(false)
            }
        }

        loadInvoice()
    }, [invoiceId])

    const handleDownloadPDF = async () => {
        try {
            await downloadInvoicePDF(invoiceId)
            notifications.success('Invoice PDF downloaded')
        } catch (error) {
            console.error('Failed to download PDF:', error)
            notifications.error('Failed to download invoice PDF')
        }
    }

    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !invoice) {
            notifications.error('Please enter a coupon code')
            return
        }

        setIsValidatingCoupon(true)
        try {
            const result = await applyCouponToInvoice(invoiceId, couponCode)
            if (result.success && result.invoice) {
                setInvoice(result.invoice)
                if (result.invoice.coupon) {
                    setAppliedCoupon({
                        code: result.invoice.coupon.code,
                        type: result.invoice.coupon.type,
                        value: result.invoice.coupon.value,
                    })
                }
                notifications.success('Coupon applied successfully')
                setCouponCode('')
            } else {
                notifications.error(result.message || 'Failed to apply coupon')
            }
        } catch (error: unknown) {
            console.error('Error applying coupon:', error)
            if (
                error &&
                typeof error === 'object' &&
                'response' in error &&
                (
                    error.response as {
                        data?: {
                            message?: string
                            errors?: Array<{ message?: string }>
                        }
                    }
                )?.data
            ) {
                const errorData = (
                    error.response as {
                        data: {
                            message?: string
                            errors?: Array<{ message?: string }>
                        }
                    }
                ).data
                const errorMessage =
                    errorData.message ||
                    errorData.errors?.map((e) => e.message).join(', ') ||
                    'Failed to apply coupon'
                notifications.error(errorMessage)
            } else {
                notifications.error('Failed to apply coupon')
            }
        } finally {
            setIsValidatingCoupon(false)
        }
    }

    const calculateDiscountedAmount = () => {
        if (!invoice) return 0
        return calculateAmountWithCoupon(
            invoice.amount,
            appliedCoupon || invoice.coupon
        )
    }

    const handlePay = async () => {
        if (!invoice) return

        setIsPaying(true)
        try {
            if (paymentProvider === PaymentProvider.ACCOUNT_BALANCE) {
                notifications.info(
                    'Account balance payment not yet implemented'
                )
            } else {
                notifications.info(
                    'Stripe payment integration not yet implemented'
                )
            }
        } catch (error) {
            console.error('Error processing payment:', error)
            notifications.error('Failed to process payment')
        } finally {
            setIsPaying(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-4xl items-center justify-center py-20">
                    <Spinner size="xl" />
                </div>
            </div>
        )
    }

    if (!invoice) {
        return null
    }

    return (
        <div className="min-h-screen bg-black px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Invoice Details
                            </h1>
                            <p className="text-zinc-400">
                                Invoice #{invoice.uuid.substring(0, 8)}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="mb-4">
                                <InvoiceStatusBadge status={invoice.status} />
                            </div>
                            <div className="space-y-1 text-sm">
                                <p className="text-zinc-400">
                                    Invoice Date:{' '}
                                    <span className="font-semibold text-white">
                                        {formatDate(
                                            invoice.timestamps.createdAt
                                        )}
                                    </span>
                                </p>
                                <p className="text-zinc-400">
                                    Due Date:{' '}
                                    <span className="font-semibold text-white">
                                        {formatShortDate(
                                            invoice.timestamps.expiresAt
                                        )}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 rounded-lg border border-zinc-900 bg-zinc-950 p-4">
                    <h2 className="mb-2 text-sm font-semibold text-white">
                        Billed To
                    </h2>
                    <div className="space-y-0.5">
                        <p className="text-sm text-white">
                            {user?.profile?.username ||
                                user?.firstName ||
                                'Customer'}
                        </p>
                        <p className="text-xs text-zinc-400">{user?.email}</p>
                    </div>
                </div>

                <div className="mb-6 rounded-lg border border-zinc-900 bg-zinc-950 p-6 lg:p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-zinc-900"
                                    >
                                        <td className="px-4 py-3 text-white">
                                            {item.name}
                                        </td>
                                        <td className="px-4 py-3 text-right text-white">
                                            {formatAmount(
                                                item.total,
                                                invoice.currency
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 border-t border-zinc-800 pt-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">
                                    Subtotal
                                </span>
                                <span className="text-white">
                                    {formatAmount(
                                        invoice.amount,
                                        invoice.currency
                                    )}
                                </span>
                            </div>

                            {appliedCoupon && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400">
                                            Coupon ({appliedCoupon.code})
                                        </span>
                                        {invoice.status ===
                                            InvoiceStatus.PENDING && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={async () => {
                                                    try {
                                                        const result =
                                                            await removeCouponFromInvoice(
                                                                invoiceId
                                                            )
                                                        if (
                                                            result.success &&
                                                            result.invoice
                                                        ) {
                                                            setInvoice(
                                                                result.invoice
                                                            )
                                                            setAppliedCoupon(
                                                                null
                                                            )
                                                            notifications.success(
                                                                'Coupon removed successfully'
                                                            )
                                                        } else {
                                                            notifications.error(
                                                                result.message ||
                                                                    'Failed to remove coupon'
                                                            )
                                                        }
                                                    } catch (error: unknown) {
                                                        console.error(
                                                            'Error removing coupon:',
                                                            error
                                                        )
                                                        if (
                                                            error &&
                                                            typeof error ===
                                                                'object' &&
                                                            'response' in
                                                                error &&
                                                            (
                                                                error.response as {
                                                                    data?: {
                                                                        message?: string
                                                                    }
                                                                }
                                                            )?.data
                                                        ) {
                                                            const errorData = (
                                                                error.response as {
                                                                    data: {
                                                                        message?: string
                                                                    }
                                                                }
                                                            ).data
                                                            notifications.error(
                                                                errorData.message ||
                                                                    'Failed to remove coupon'
                                                            )
                                                        } else {
                                                            notifications.error(
                                                                'Failed to remove coupon'
                                                            )
                                                        }
                                                    }
                                                }}
                                                className="border-primary-400/50 bg-primary-400/20 hover:bg-primary-400/30 text-primary-300 h-auto px-2 py-1 text-xs"
                                            >
                                                <i className="fas fa-times mr-1"></i>
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    <span className="text-green-400">
                                        -
                                        {formatAmount(
                                            invoice.amount -
                                                calculateDiscountedAmount(),
                                            invoice.currency
                                        )}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                                <span className="text-xl font-bold text-white">
                                    Total
                                </span>
                                <span className="text-2xl font-bold text-green-400">
                                    {formatAmount(
                                        calculateDiscountedAmount(),
                                        invoice.currency
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {invoice.status === InvoiceStatus.PENDING && (
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                            <h2 className="mb-4 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                                Apply Coupon
                            </h2>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <InputLabel htmlFor="couponCode">
                                        Coupon Code
                                    </InputLabel>
                                    <Input
                                        id="couponCode"
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) =>
                                            setCouponCode(
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="Enter coupon code"
                                        disabled={
                                            !!appliedCoupon ||
                                            isValidatingCoupon
                                        }
                                    />
                                </div>
                                <div className="flex items-end">
                                    {appliedCoupon ? (
                                        <Button
                                            variant="ghost"
                                            onClick={async () => {
                                                try {
                                                    const result =
                                                        await removeCouponFromInvoice(
                                                            invoiceId
                                                        )
                                                    if (
                                                        result.success &&
                                                        result.invoice
                                                    ) {
                                                        setInvoice(
                                                            result.invoice
                                                        )
                                                        setAppliedCoupon(null)
                                                        notifications.success(
                                                            'Coupon removed successfully'
                                                        )
                                                    } else {
                                                        notifications.error(
                                                            result.message ||
                                                                'Failed to remove coupon'
                                                        )
                                                    }
                                                } catch (error: unknown) {
                                                    console.error(
                                                        'Error removing coupon:',
                                                        error
                                                    )
                                                    if (
                                                        error &&
                                                        typeof error ===
                                                            'object' &&
                                                        'response' in error &&
                                                        (
                                                            error.response as {
                                                                data?: {
                                                                    message?: string
                                                                }
                                                            }
                                                        )?.data
                                                    ) {
                                                        const errorData = (
                                                            error.response as {
                                                                data: {
                                                                    message?: string
                                                                }
                                                            }
                                                        ).data
                                                        notifications.error(
                                                            errorData.message ||
                                                                'Failed to remove coupon'
                                                        )
                                                    } else {
                                                        notifications.error(
                                                            'Failed to remove coupon'
                                                        )
                                                    }
                                                }
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            onClick={handleApplyCoupon}
                                            loading={isValidatingCoupon}
                                            disabled={
                                                isValidatingCoupon ||
                                                !couponCode.trim()
                                            }
                                        >
                                            Apply
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {appliedCoupon && (
                                <p className="mt-2 text-sm text-green-400">
                                    Coupon {appliedCoupon.code} applied:{' '}
                                    {appliedCoupon.type === 'percentage'
                                        ? `${appliedCoupon.value}%`
                                        : `$${appliedCoupon.value.toFixed(2)}`}{' '}
                                    discount
                                </p>
                            )}
                        </div>

                        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                            <h2 className="mb-4 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                                Payment
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="paymentProvider">
                                        Payment Method
                                    </InputLabel>
                                    <SelectMenu
                                        id="paymentProvider"
                                        value={paymentProvider}
                                        onChange={(e) =>
                                            setPaymentProvider(
                                                e.target
                                                    .value as PaymentProvider
                                            )
                                        }
                                        options={[
                                            {
                                                value: PaymentProvider.STRIPE,
                                                label: 'Stripe',
                                            },
                                            {
                                                value: PaymentProvider.ACCOUNT_BALANCE,
                                                label: 'Account Balance',
                                            },
                                        ]}
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={handlePay}
                                    loading={isPaying}
                                    disabled={isPaying}
                                    className="w-full"
                                    icon={
                                        paymentProvider ===
                                        PaymentProvider.STRIPE
                                            ? 'fab fa-stripe'
                                            : undefined
                                    }
                                >
                                    Pay Now
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/client/invoices')}
                        icon="fas fa-arrow-left"
                    >
                        Back
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleDownloadPDF}
                        icon="fas fa-download"
                    >
                        Download PDF
                    </Button>
                </div>
            </div>
        </div>
    )
}
