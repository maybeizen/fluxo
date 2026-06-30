'use client'

import React from 'react'
import Button from '@/components/ui/button'

interface CheckoutBillingInfoProps {
    email: string
    onRestartOrder: () => void
    onCreateInvoice: () => void
    isCreatingInvoice?: boolean
}

export default function CheckoutBillingInfo({
    email,
    onRestartOrder,
    onCreateInvoice,
    isCreatingInvoice = false,
}: CheckoutBillingInfoProps) {
    return (
        <div className="mb-6 rounded-lg border border-zinc-900 bg-zinc-950 p-6 lg:p-8">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="flex-1">
                    <p className="mb-4 text-zinc-400">
                        Billing to:{' '}
                        <span className="font-semibold text-white">
                            {email}
                        </span>
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5">
                        <i className="fas fa-lock text-sm text-green-400"></i>
                        <span className="text-xs text-zinc-400">
                            Secured by
                        </span>
                        <div className="flex items-center">
                            <i
                                className="fab fa-stripe text-[#635BFF]"
                                style={{ fontSize: '1.5rem' }}
                            ></i>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={onRestartOrder}>
                        Restart Order
                    </Button>
                    <Button
                        variant="success"
                        icon="fas fa-shopping-cart"
                        iconPosition="left"
                        onClick={onCreateInvoice}
                        loading={isCreatingInvoice}
                        disabled={isCreatingInvoice}
                    >
                        Create Invoice
                    </Button>
                </div>
            </div>
        </div>
    )
}
