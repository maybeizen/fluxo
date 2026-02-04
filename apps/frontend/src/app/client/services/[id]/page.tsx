'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Service, ServiceStatus } from '@fluxo/types'
import {
    fetchServiceById,
    updateServiceName,
    cancelService,
} from '@/lib/dashboard'
import { formatPrice, formatShortDate } from '@/utils/formatting'
import { ServiceHeader } from '@/components/client/service-v2/service-header'
import { ServiceStats } from '@/components/client/service-v2/service-stats'
import { ServiceTabs } from '@/components/client/service-v2/service-tabs'
import { OverviewTab } from '@/components/client/service-v2/overview-tab'
import { ManageTab } from '@/components/client/service-v2/manage-tab'
import { SettingsTab } from '@/components/client/service-v2/settings-tab'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'
import axios from 'axios'

export default function ServiceDetailPage() {
    const [activeTab, setActiveTab] = useState('overview')
    const params = useParams()
    const router = useRouter()
    const notifications = useNotifications()
    const [service, setService] = useState<Service | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const hasAttemptedFetch = useRef(false)

    const serviceId = params.id as string

    useEffect(() => {
        if (hasAttemptedFetch.current || !serviceId) return

        const loadService = async () => {
            hasAttemptedFetch.current = true
            setIsLoading(true)
            try {
                const data = await fetchServiceById(serviceId)
                setService(data)
            } catch (error) {
                console.error('Error loading service:', error)

                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
                    router.push('/not-found')
                } else if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 403
                ) {
                    router.push('/unauthorized')
                } else {
                    notifications.error('Failed to load service details')
                    router.push('/client')
                }
            } finally {
                setIsLoading(false)
            }
        }

        loadService()
    }, [serviceId, router])

    const handleSaveServiceName = async (newName: string) => {
        if (!service) return

        try {
            const updatedService = await updateServiceName(
                service.uuid,
                newName
            )
            setService(updatedService)
        } catch (error) {
            throw new Error('Failed to update service name')
        }
    }

    const handleCancelService = async (reason: string) => {
        if (!service) return

        try {
            await cancelService(service.uuid, reason)
            notifications.success('Service cancelled successfully')
            router.push('/client')
        } catch (error) {
            notifications.error('Failed to cancel service')
            throw error
        }
    }

    const getDiagnosticsStatus = (
        status: ServiceStatus,
        hasError: boolean
    ): 'operational' | 'degraded' | 'offline' | 'error' => {
        if (hasError) return 'error'

        switch (status) {
            case ServiceStatus.ACTIVE:
                return 'operational'
            case ServiceStatus.SUSPENDED:
                return 'degraded'
            default:
                return 'offline'
        }
    }

    const getDiagnosticsMessage = (
        status: ServiceStatus,
        hasError: boolean
    ): string => {
        if (hasError) {
            return 'Your service failed to create properly and requires administrator intervention.'
        }

        switch (status) {
            case ServiceStatus.ACTIVE:
                return 'Your service is fully configured and ready to use.'
            case ServiceStatus.SUSPENDED:
                return 'Your service is currently suspended. Please pay your outstanding invoices.'
            case ServiceStatus.CANCELLED:
                return 'Your service has been cancelled and is no longer active.'
            default:
                return 'Service status unknown.'
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    if (!service) {
        return null
    }

    const diagnosticsStatus = getDiagnosticsStatus(
        service.status,
        service.creationError
    )

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line' },
        { id: 'manage', label: 'Manage', icon: 'fas fa-server' },
        { id: 'settings', label: 'Settings', icon: 'fas fa-gear' },
    ]

    return (
        <div className="min-h-screen bg-black px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <ServiceHeader
                    serviceName={service.serviceName}
                    product={service.product}
                    status={service.status}
                    externalId={service.externalId}
                />

                <ServiceStats
                    price={formatPrice(service.monthlyPrice)}
                    location={service.location}
                    dueDate={formatShortDate(service.dueDate)}
                />

                <ServiceTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            serviceName={service.serviceName}
                            dedicatedIp={service.dedicatedIp}
                            proxyAddon={service.proxyAddon}
                            status={diagnosticsStatus}
                            diagnosticsMessage={getDiagnosticsMessage(
                                service.status,
                                service.creationError
                            )}
                            hasCreationError={service.creationError}
                            onSaveServiceName={handleSaveServiceName}
                        />
                    )}

                    {activeTab === 'manage' && (
                        <ManageTab
                            serviceId={service.uuid}
                            hasCreationError={service.creationError}
                        />
                    )}

                    {activeTab === 'settings' && (
                        <SettingsTab
                            serviceName={service.serviceName}
                            dueDate={service.dueDate}
                            status={diagnosticsStatus}
                            hasCreationError={service.creationError}
                            onSaveServiceName={handleSaveServiceName}
                            onCancelService={handleCancelService}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
