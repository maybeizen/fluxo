'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Service, ServiceStatus, User } from '@fluxo/types'
import { fetchServiceById, updateService } from '@/lib/admin/services'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import Checkbox from '@/components/ui/input/checkbox'
import UserSearchSelect from '@/components/ui/input/user-search-select'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'

export default function EditServicePage() {
    const router = useRouter()
    const params = useParams()
    const notifications = useNotifications()
    const serviceId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [service, setService] = useState<Service | null>(null)

    const [serviceName, setServiceName] = useState('')
    const [serviceOwnerId, setServiceOwnerId] = useState('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [status, setStatus] = useState<ServiceStatus>(ServiceStatus.ACTIVE)
    const [monthlyPrice, setMonthlyPrice] = useState(0)
    const [dueDate, setDueDate] = useState('')
    const [location, setLocation] = useState('')
    const [dedicatedIp, setDedicatedIp] = useState(false)
    const [proxyAddon, setProxyAddon] = useState(false)
    const [creationError, setCreationError] = useState(false)

    const handleUserSelect = (userId: string, user: User) => {
        setServiceOwnerId(userId)
        setSelectedUser(user)
    }

    useEffect(() => {
        const loadService = async () => {
            try {
                const data = await fetchServiceById(serviceId)
                setService(data)
                setServiceName(data.serviceName)
                setServiceOwnerId(data.serviceOwnerId)
                setStatus(data.status)
                setMonthlyPrice(data.monthlyPrice)
                setDueDate(
                    data.dueDate
                        ? new Date(data.dueDate).toISOString().split('T')[0]
                        : ''
                )
                setLocation(data.location)
                setDedicatedIp(data.dedicatedIp)
                setProxyAddon(data.proxyAddon)
                setCreationError(data.creationError)
            } catch (error) {
                console.error('Error loading service:', error)
                notifications.error('Failed to load service')
                router.push('/admin/services')
            } finally {
                setIsLoading(false)
            }
        }

        loadService()
    }, [serviceId])

    const hasChanges = () => {
        if (!service) return false

        const currentDueDate = service.dueDate
            ? new Date(service.dueDate).toISOString().split('T')[0]
            : ''

        return (
            serviceName !== service.serviceName ||
            serviceOwnerId !== service.serviceOwnerId ||
            status !== service.status ||
            monthlyPrice !== service.monthlyPrice ||
            dueDate !== currentDueDate ||
            location !== service.location ||
            dedicatedIp !== service.dedicatedIp ||
            proxyAddon !== service.proxyAddon ||
            creationError !== service.creationError
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!hasChanges()) {
            notifications.info('No changes to save')
            router.push('/admin/services')
            return
        }

        setIsSaving(true)

        try {
            const updates: Partial<Service> = {}

            if (serviceName !== service?.serviceName)
                updates.serviceName = serviceName
            if (serviceOwnerId !== service?.serviceOwnerId)
                updates.serviceOwnerId = serviceOwnerId
            if (status !== service?.status) updates.status = status
            if (monthlyPrice !== service?.monthlyPrice)
                updates.monthlyPrice = monthlyPrice

            const currentDueDate = service?.dueDate
                ? new Date(service.dueDate).toISOString().split('T')[0]
                : ''
            if (dueDate !== currentDueDate && dueDate) {
                updates.dueDate = new Date(dueDate)
            }

            if (location !== service?.location) updates.location = location
            if (dedicatedIp !== service?.dedicatedIp)
                updates.dedicatedIp = dedicatedIp
            if (proxyAddon !== service?.proxyAddon)
                updates.proxyAddon = proxyAddon
            if (creationError !== service?.creationError)
                updates.creationError = creationError

            await updateService(serviceId, updates)
            notifications.success('Service updated successfully')
            router.push('/admin/services')
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'NO_CHANGES') {
                notifications.info('No changes to save')
                router.push('/admin/services')
            } else {
                console.error('Error updating service:', error)
                notifications.error('Failed to update service')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        router.push('/admin/services')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
                <div className="mx-auto flex max-w-4xl items-center justify-center py-20">
                    <Spinner size="xl" />
                </div>
            </div>
        )
    }

    if (!service) {
        return null
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Edit Service
                        </h1>
                        <p className="text-zinc-400">
                            Update service details and settings
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        icon="fas fa-arrow-left"
                    >
                        Back to Services
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Service Information
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="serviceName">
                                    Service Name
                                </InputLabel>
                                <Input
                                    id="serviceName"
                                    type="text"
                                    value={serviceName}
                                    onChange={(e) =>
                                        setServiceName(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="serviceOwnerId">
                                    Current Owner ID
                                </InputLabel>
                                <Input
                                    id="serviceOwnerId"
                                    type="text"
                                    value={serviceOwnerId}
                                    disabled
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="serviceOwner">
                                    Change Service Owner
                                </InputLabel>
                                <UserSearchSelect
                                    value={serviceOwnerId}
                                    onSelect={handleUserSelect}
                                    placeholder="Search to change owner..."
                                />
                                {selectedUser && (
                                    <p className="mt-2 text-xs text-zinc-500">
                                        New owner:{' '}
                                        {selectedUser.profile?.username ||
                                            selectedUser.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="product">
                                    Product
                                </InputLabel>
                                <Input
                                    id="product"
                                    type="text"
                                    value={service.product}
                                    disabled
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="externalId">
                                    External ID
                                </InputLabel>
                                <Input
                                    id="externalId"
                                    type="text"
                                    value={service.externalId || 'Not assigned'}
                                    disabled
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="status">Status</InputLabel>
                                <SelectMenu
                                    id="status"
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(
                                            e.target.value as ServiceStatus
                                        )
                                    }
                                    options={[
                                        {
                                            value: ServiceStatus.ACTIVE,
                                            label: 'Active',
                                        },
                                        {
                                            value: ServiceStatus.SUSPENDED,
                                            label: 'Suspended',
                                        },
                                        {
                                            value: ServiceStatus.CANCELLED,
                                            label: 'Cancelled',
                                        },
                                        {
                                            value: ServiceStatus.DELETED,
                                            label: 'Deleted',
                                        },
                                    ]}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="monthlyPrice">
                                    Monthly Price ($)
                                </InputLabel>
                                <Input
                                    id="monthlyPrice"
                                    type="number"
                                    step="0.01"
                                    value={monthlyPrice.toString()}
                                    onChange={(e) =>
                                        setMonthlyPrice(
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="dueDate">
                                    Due Date
                                </InputLabel>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="location">
                                    Location
                                </InputLabel>
                                <Input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Add-ons & Options
                        </h2>

                        <div className="space-y-4">
                            <Checkbox
                                label="Dedicated IP"
                                checked={dedicatedIp}
                                onChange={(e) =>
                                    setDedicatedIp(e.target.checked)
                                }
                            />

                            <Checkbox
                                label="Proxy Addon"
                                checked={proxyAddon}
                                onChange={(e) =>
                                    setProxyAddon(e.target.checked)
                                }
                            />

                            <Checkbox
                                label="Creation Error"
                                checked={creationError}
                                onChange={(e) =>
                                    setCreationError(e.target.checked)
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isSaving}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
