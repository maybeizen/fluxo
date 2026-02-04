'use client'

import React from 'react'
import { Product } from '@fluxo/types'

const LOCATION_MAP: Record<string, string> = {
    'new-york': 'New York',
    miami: 'Florida',
    germany: 'Germany',
    singapore: 'Singapore',
}

interface CheckoutOrderSummaryProps {
    selectedPlan: Product
    location: string
    dedicatedIP: boolean
    proxySetup: boolean
}

export default function CheckoutOrderSummary({
    selectedPlan,
    location,
    dedicatedIP,
    proxySetup,
}: CheckoutOrderSummaryProps) {
    const formatPrice = (price: number) => {
        return `$${(price / 100).toFixed(2)}`
    }

    const calculateSubtotal = () => {
        let subtotal = selectedPlan.metadata.price
        if (dedicatedIP) {
            subtotal += 299
        }
        return subtotal
    }

    const calculateLocationSurcharge = () => {
        if (location === 'singapore') {
            return Math.round(selectedPlan.metadata.price * 0.15)
        }
        return 0
    }

    const calculateTotal = () => {
        let total = calculateSubtotal() + calculateLocationSurcharge()
        if (proxySetup) {
            total += 1000
        }
        return total
    }

    return (
        <div className="mb-6 rounded-lg border border-zinc-900 bg-zinc-950 p-6 lg:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
                Order Summary
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="px-4 py-3 text-left font-medium text-zinc-400">
                                Description
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-zinc-400">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-zinc-800">
                            <td className="px-4 py-3 text-white">
                                Server Plan: {selectedPlan.metadata.name}
                            </td>
                            <td className="px-4 py-3 text-right text-white">
                                {formatPrice(selectedPlan.metadata.price)}
                            </td>
                        </tr>
                        <tr className="border-b border-zinc-800">
                            <td className="px-4 py-3 text-white">
                                Location: {LOCATION_MAP[location] || location}
                                {location === 'singapore' && (
                                    <span className="ml-2 text-xs text-yellow-400">
                                        (15% high demand surcharge)
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-right text-white">
                                {location === 'singapore' ? (
                                    <span className="text-yellow-400">
                                        +
                                        {formatPrice(
                                            calculateLocationSurcharge()
                                        )}
                                    </span>
                                ) : (
                                    'Free'
                                )}
                            </td>
                        </tr>
                        <tr className="border-b border-zinc-800">
                            <td className="px-4 py-3 text-white">
                                Dedicated IP
                            </td>
                            <td className="px-4 py-3 text-right text-white">
                                {dedicatedIP
                                    ? formatPrice(299) + '/month'
                                    : 'No Dedicated IP'}
                            </td>
                        </tr>
                        <tr className="border-b border-zinc-800">
                            <td className="px-4 py-3 text-white">
                                Proxy Setup (one-time)
                            </td>
                            <td className="px-4 py-3 text-right text-white">
                                {proxySetup ? '+$10.00' : 'No Proxy Setup'}
                            </td>
                        </tr>
                        <tr className="border-b border-zinc-800">
                            <td className="px-4 py-3 text-white">Subtotal</td>
                            <td className="px-4 py-3 text-right text-white">
                                {formatPrice(calculateSubtotal())}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-4 text-xl font-semibold text-white">
                                Total
                            </td>
                            <td className="px-4 py-4 text-right text-2xl font-semibold text-green-500">
                                {formatPrice(calculateTotal())}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p className="mt-3 text-left text-xs text-zinc-500">
                    Applicable taxes may apply depending on your location and
                    will be determined by Stripe, Inc. during checkout. They may
                    not appear on this page.
                </p>
            </div>
        </div>
    )
}
