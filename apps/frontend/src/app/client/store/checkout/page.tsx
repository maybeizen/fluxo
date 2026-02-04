'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { Product } from '@fluxo/types'
import { fetchProducts } from '@/lib/client/products'
import { createInvoiceFromCheckout } from '@/lib/client/invoices'
import { useNotifications } from '@/context/notification-context'
import Spinner from '@/components/ui/spinner'
import CheckoutHeader from '@/components/client/store/checkout/checkout-header'
import CheckoutServerDetails from '@/components/client/store/checkout/checkout-server-details'
import CheckoutOrderSummary from '@/components/client/store/checkout/checkout-order-summary'
import CheckoutBillingInfo from '@/components/client/store/checkout/checkout-billing-info'
import CheckoutInfoBox from '@/components/client/store/checkout/checkout-info-box'
import GatewayPluginSelector from '@/components/client/store/checkout/gateway-plugin-selector'

type MinecraftType = 'java' | 'bedrock'

interface CheckoutData {
    type: MinecraftType
    location: string
    planId: string
    serviceName: string
    version: string
    dedicatedIP: boolean
    proxySetup: boolean
}

export default function CheckoutSummaryPage() {
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const notifications = useNotifications()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
    const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
    const [gatewayPluginId, setGatewayPluginId] = useState('')

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true)
            try {
                const data = await fetchProducts()
                setProducts(data)
            } catch (error) {
                console.error('Error loading products:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadProducts()
    }, [])

    useEffect(() => {
        const type = searchParams.get('type') as MinecraftType
        const location = searchParams.get('location')
        const planId = searchParams.get('planId')
        const serviceName = searchParams.get('serviceName')
        const version = searchParams.get('version')
        const dedicatedIP = searchParams.get('dedicatedIP') === 'true'
        const proxySetup = searchParams.get('proxySetup') === 'true'

        if (type && location && planId && serviceName && version) {
            setCheckoutData({
                type,
                location,
                planId,
                serviceName,
                version,
                dedicatedIP,
                proxySetup,
            })
        } else {
            router.push('/client/store')
        }
    }, [searchParams, router])

    useEffect(() => {
        if (!isLoading && checkoutData && products.length > 0) {
            const selectedPlan = products.find(
                (p) => p.uuid === checkoutData.planId
            )
            if (!selectedPlan) {
                router.push('/client/store')
            }
        }
    }, [checkoutData, products, isLoading, router])

    if (!user) {
        return null
    }

    if (isLoading || !checkoutData || products.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <Spinner />
            </div>
        )
    }

    const selectedPlan = products.find((p) => p.uuid === checkoutData.planId)

    if (!selectedPlan) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <Spinner />
            </div>
        )
    }

    const checkoutDate = new Date()

    const getServerType = () => {
        if (checkoutData.proxySetup) {
            return 'Minecraft Proxy'
        }
        return checkoutData.type === 'java'
            ? 'Minecraft: Java Edition'
            : 'Minecraft: Bedrock Edition'
    }

    const handleRestartOrder = () => {
        router.push('/client/store')
    }

    const calculateSubtotal = () => {
        if (!selectedPlan) return 0
        let subtotal = selectedPlan.metadata.price
        if (checkoutData.dedicatedIP) {
            subtotal += 299
        }
        return subtotal
    }

    const calculateLocationSurcharge = () => {
        if (!selectedPlan) return 0
        if (checkoutData.location === 'singapore') {
            return Math.round(selectedPlan.metadata.price * 0.15)
        }
        return 0
    }

    const calculateTotal = () => {
        let total = calculateSubtotal() + calculateLocationSurcharge()
        if (checkoutData.proxySetup) {
            total += 1000
        }
        return total
    }

    const handleCreateInvoice = async () => {
        if (!checkoutData || !selectedPlan) return

        setIsCreatingInvoice(true)

        try {
            const items = []
            const LOCATION_MAP: Record<string, string> = {
                'new-york': 'New York',
                miami: 'Florida',
                germany: 'Germany',
                singapore: 'Singapore',
            }

            items.push({
                name: `Server Plan: ${selectedPlan.metadata.name}`,
                quantity: 1,
                unitPrice: selectedPlan.metadata.price,
                total: selectedPlan.metadata.price,
            })

            if (checkoutData.location === 'singapore') {
                const surcharge = calculateLocationSurcharge()
                items.push({
                    name: `Location: ${LOCATION_MAP[checkoutData.location]} (15% high demand surcharge)`,
                    quantity: 1,
                    unitPrice: surcharge,
                    total: surcharge,
                })
            }

            if (checkoutData.dedicatedIP) {
                items.push({
                    name: 'Dedicated IP',
                    quantity: 1,
                    unitPrice: 299,
                    total: 299,
                })
            }

            if (checkoutData.proxySetup) {
                items.push({
                    name: 'Proxy Setup (one-time)',
                    quantity: 1,
                    unitPrice: 1000,
                    total: 1000,
                })
            }

            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + 30)

            const expiresAt = new Date(dueDate)
            expiresAt.setDate(expiresAt.getDate() + 7)

            const invoiceData = {
                items: items.map((item) => ({
                    ...item,
                    unitPrice: item.unitPrice / 100,
                    total: item.total / 100,
                })),
                amount: calculateTotal() / 100,
                currency: 'usd',
                metadata: {
                    type: checkoutData.type,
                    location: checkoutData.location,
                    planId: checkoutData.planId,
                    serviceName: checkoutData.serviceName,
                    version: checkoutData.version,
                    dedicatedIP: checkoutData.dedicatedIP,
                    proxySetup: checkoutData.proxySetup,
                },
                expiresAt: expiresAt.toISOString(),
            }

            const result = await createInvoiceFromCheckout(invoiceData)

            if (result.success && result.invoice) {
                notifications.success('Invoice created successfully')
                router.push(`/client/invoices/${result.invoice.uuid}`)
            } else {
                notifications.error(
                    result.message || 'Failed to create invoice'
                )
            }
        } catch (error: unknown) {
            console.error('Error creating invoice:', error)
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
                    'Failed to create invoice'
                notifications.error(errorMessage)
            } else {
                notifications.error('Failed to create invoice')
            }
        } finally {
            setIsCreatingInvoice(false)
        }
    }

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-4xl">
                <CheckoutHeader checkoutDate={checkoutDate} />

                <CheckoutServerDetails
                    serverType={getServerType()}
                    serviceName={checkoutData.serviceName}
                    location={checkoutData.location}
                />

                <CheckoutOrderSummary
                    selectedPlan={selectedPlan}
                    location={checkoutData.location}
                    dedicatedIP={checkoutData.dedicatedIP}
                    proxySetup={checkoutData.proxySetup}
                />

                <div className="space-y-4">
                    <GatewayPluginSelector
                        value={gatewayPluginId}
                        onChange={setGatewayPluginId}
                        includeDefault
                        defaultLabel="Stripe"
                    />
                    <CheckoutBillingInfo
                        email={user.email}
                        onRestartOrder={handleRestartOrder}
                        onCreateInvoice={handleCreateInvoice}
                        isCreatingInvoice={isCreatingInvoice}
                    />
                </div>

                <CheckoutInfoBox />
            </div>
        </div>
    )
}
