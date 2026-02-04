'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@fluxo/types'
import Button from '@/components/ui/button'

interface OrderSummaryProps {
    selectedPlan: Product | null
    dedicatedIP: boolean
    proxySetup: boolean
    minecraftType?: 'java' | 'bedrock'
    location?: string
    serviceName?: string
    version?: string
}

export default function OrderSummary({
    selectedPlan,
    dedicatedIP,
    proxySetup,
    minecraftType,
    location,
    serviceName,
    version,
}: OrderSummaryProps) {
    const router = useRouter()
    const formatPrice = (price: number) => {
        return `$${(price / 100).toFixed(2)}/mo`
    }

    const calculateLocationSurcharge = () => {
        if (!selectedPlan || location !== 'singapore') return 0
        return Math.round(selectedPlan.metadata.price * 0.15)
    }

    const calculateTotalPrice = () => {
        if (!selectedPlan) return 0

        let total = selectedPlan.metadata.price
        if (dedicatedIP) {
            total += 299
        }
        total += calculateLocationSurcharge()
        if (proxySetup) {
            total += 1000
        }
        return total
    }

    if (!selectedPlan) return null

    return (
        <div className="animate-[fadeInUp_0.5s_ease-out] rounded-lg border border-zinc-900 bg-zinc-950 p-6 lg:p-8">
            <h2 className="mb-2 text-xl font-semibold text-white">
                Step 5: Order Summary
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
                Review your order and proceed to checkout.
            </p>

            <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-zinc-400">
                        {selectedPlan.metadata.name}
                    </span>
                    <span className="font-medium text-white">
                        {formatPrice(selectedPlan.metadata.price)}
                    </span>
                </div>

                {dedicatedIP && (
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-400">
                            Dedicated IP Address
                        </span>
                        <span className="font-medium text-white">
                            $2.99/month
                        </span>
                    </div>
                )}

                {proxySetup && (
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-400">
                            Proxy Setup (one-time)
                        </span>
                        <span className="font-medium text-white">+$10.00</span>
                    </div>
                )}

                {location === 'singapore' &&
                    calculateLocationSurcharge() > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400">
                                Location Surcharge (Singapore)
                                <span className="ml-2 text-xs text-yellow-400">
                                    (15% high demand)
                                </span>
                            </span>
                            <span className="font-medium text-yellow-400">
                                +{formatPrice(calculateLocationSurcharge())}
                            </span>
                        </div>
                    )}

                <div className="border-t border-zinc-800 pt-6">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xl font-semibold text-white">
                            Monthly Total
                        </span>
                        <span className="text-primary-400 text-2xl font-bold">
                            {formatPrice(calculateTotalPrice())}
                        </span>
                    </div>
                    <p className="text-right text-xs text-zinc-500">
                        * Taxes may apply depending on your location and will be
                        collected by our payment processor
                    </p>
                </div>
            </div>

            <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => {
                    if (
                        selectedPlan &&
                        minecraftType &&
                        location &&
                        serviceName &&
                        version
                    ) {
                        const params = new URLSearchParams({
                            type: minecraftType,
                            location,
                            planId: selectedPlan.uuid,
                            serviceName,
                            version,
                            dedicatedIP: dedicatedIP.toString(),
                            proxySetup: proxySetup.toString(),
                        })
                        router.push(
                            `/client/store/checkout?${params.toString()}`
                        )
                    }
                }}
            >
                Proceed to Checkout
            </Button>

            <p className="mt-4 text-center text-xs text-zinc-500">
                Note: Coupons can be applied directly to invoices, not in the
                summary page.
            </p>
        </div>
    )
}
