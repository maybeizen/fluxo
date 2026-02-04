'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { Service } from '@fluxo/types'
import ServiceCard from '@/components/dashboard/service-card'
import { fetchServices } from '@/lib/dashboard'
import Card from '@/components/ui/card'
import EmptyState from '@/components/ui/empty-state'
import LoadingState from '@/components/ui/loading-state'
import Button from '@/components/ui/button'
import PageHeader from '@/components/client/page-header'

export default function ServicesPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [services, setServices] = useState<Service[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadServices = async () => {
            setIsLoading(true)
            const data = await fetchServices()
            setServices(data)
            setIsLoading(false)
        }

        loadServices()
    }, [])

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <PageHeader
                    title="Your Services"
                    description="Manage all your services in one place"
                    action={
                        <Button
                            variant="primary"
                            icon="fas fa-plus"
                            iconPosition="left"
                            onClick={() => router.push('/client/store')}
                        >
                            Buy a Server
                        </Button>
                    }
                />

                <Card padding="lg">
                    {isLoading ? (
                        <LoadingState size="lg" />
                    ) : services.length === 0 ? (
                        <EmptyState
                            icon="fas fa-objects-column"
                            title="No Services Yet"
                            description="You don't have any active services. Get started by creating your first server!"
                            action={{
                                label: 'Create Your First Service',
                                icon: 'fas fa-plus',
                                onClick: () => router.push('/client/store'),
                            }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {services.map((service) => (
                                <ServiceCard
                                    key={service.uuid}
                                    service={service}
                                />
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
