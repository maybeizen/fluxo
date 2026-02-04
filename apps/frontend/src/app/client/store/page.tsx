'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { Product } from '@fluxo/types'
import { fetchProducts } from '@/lib/client/products'
import ServiceConfig from '@/components/client/store/service-config'
import TypeSelection from '@/components/client/store/type-selection'
import PlanSelection from '@/components/client/store/plan-selection'
import LocationSelection from '@/components/client/store/location-selection'
import OrderSummary from '@/components/client/store/order-summary'
import PageHeader from '@/components/client/page-header'
import Card from '@/components/ui/card'

type MinecraftType = 'java' | 'bedrock'

export default function StorePage() {
    const { user } = useAuth()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(true)

    const [serviceName, setServiceName] = useState('')
    const [version, setVersion] = useState('latest')
    const [dedicatedIP, setDedicatedIP] = useState(false)
    const [proxySetup, setProxySetup] = useState(false)

    const [minecraftType, setMinecraftType] = useState<MinecraftType>('java')

    const [selectedPlan, setSelectedPlan] = useState<string>('')

    const [location, setLocation] = useState('')

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoadingProducts(true)
            try {
                const data = await fetchProducts()
                setProducts(data)
            } catch (error) {
                console.error('Error loading products:', error)
            } finally {
                setIsLoadingProducts(false)
            }
        }

        loadProducts()
    }, [])

    if (!user) {
        return null
    }

    const canAccessLocation = minecraftType !== null
    const canAccessPlan = canAccessLocation && location !== ''
    const canAccessConfig = canAccessPlan && selectedPlan !== ''
    const canViewSummary =
        canAccessConfig && serviceName.trim().length > 0 && version !== ''

    const selectedProduct =
        products.find((p) => p.uuid === selectedPlan) || null

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <PageHeader
                    title="Purchase a Server"
                    description="Configure your Minecraft server and choose a plan"
                />

                <div className="space-y-6">
                    <Card padding="lg">
                        <TypeSelection
                            selectedType={minecraftType}
                            onTypeChange={setMinecraftType}
                        />
                    </Card>

                    <Card
                        padding="lg"
                        className={
                            !canAccessLocation
                                ? 'pointer-events-none opacity-50'
                                : ''
                        }
                    >
                        <LocationSelection
                            location={location}
                            onLocationChange={setLocation}
                        />
                    </Card>

                    <Card
                        padding="lg"
                        className={
                            !canAccessPlan
                                ? 'pointer-events-none opacity-50'
                                : ''
                        }
                    >
                        <PlanSelection
                            products={products}
                            selectedPlan={selectedPlan}
                            isLoading={isLoadingProducts}
                            onPlanSelect={setSelectedPlan}
                        />
                    </Card>

                    <Card
                        padding="lg"
                        className={
                            !canAccessConfig
                                ? 'pointer-events-none opacity-50'
                                : ''
                        }
                    >
                        <ServiceConfig
                            serviceName={serviceName}
                            version={version}
                            dedicatedIP={dedicatedIP}
                            proxySetup={proxySetup}
                            onServiceNameChange={setServiceName}
                            onVersionChange={setVersion}
                            onDedicatedIPChange={setDedicatedIP}
                            onProxySetupChange={setProxySetup}
                        />
                    </Card>

                    {canViewSummary && (
                        <Card padding="lg">
                            <OrderSummary
                                selectedPlan={selectedProduct}
                                dedicatedIP={dedicatedIP}
                                proxySetup={proxySetup}
                                minecraftType={minecraftType}
                                location={location}
                                serviceName={serviceName}
                                version={version}
                            />
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
