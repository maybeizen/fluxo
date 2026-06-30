'use client'

import React from 'react'

interface CheckoutHeaderProps {
    checkoutDate: Date
}

export default function CheckoutHeader({ checkoutDate }: CheckoutHeaderProps) {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <div className="mb-8">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-white">
                        Checkout Summary
                    </h1>
                    <p className="text-zinc-400">Server Provisioning Details</p>
                </div>
                <div className="text-right">
                    <div className="mb-4 inline-flex items-center rounded-md border border-green-500/50 bg-green-500/20 px-3 py-1">
                        <span className="text-sm font-medium text-green-400">
                            PENDING CHECKOUT
                        </span>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p className="text-zinc-400">
                            Checkout Date:{' '}
                            <span className="font-semibold text-white">
                                {formatDate(checkoutDate)}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
