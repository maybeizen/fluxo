'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createService } from '@/lib/admin/services'
import { ServiceStatus } from '@fluxo/types'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import Checkbox from '@/components/ui/input/checkbox'
import DatePicker from '@/components/ui/input/date-picker'
import UserSearchSelect from '@/components/ui/input/user-search-select'
import ProductSelect from '@/components/ui/input/product-select'
import Button from '@/components/ui/button'
import { useNotifications } from '@/context/notification-context'
import { User } from '@fluxo/types'

export default function NewServicePage() {
    const router = useRouter()
    const notifications = useNotifications()

    const [isSaving, setIsSaving] = useState(false)

    const [serviceName, setServiceName] = useState('')
    const [product, setProduct] = useState('')
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        const serviceData = {
            serviceName,
            product,
            serviceOwnerId,
            externalId: '',
            status,
            monthlyPrice,
            dueDate: new Date(dueDate),
            creationError,
            location,
            dedicatedIp,
            proxyAddon,
            cancelled: {
                isCancelled: false,
                cancellationReason: '',
                cancellationDate: new Date(),
            },
            suspended: {
                isSuspended: false,
                suspensionReason: '',
                suspensionDate: new Date(),
            },
        }

        const result = await createService(serviceData)

        if (result.success) {
            notifications.success('Service created successfully')
            router.push('/admin/services')
        } else {
            notifications.error(result.message || 'Failed to create service')
        }

        setIsSaving(false)
    }

    const handleCancel = () => {
        router.push('/admin/services')
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Create Service
                        </h1>
                        <p className="text-zinc-400">
                            Add a new service to the system
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
                            <div>
                                <InputLabel htmlFor="serviceName" required>
                                    Service Name
                                </InputLabel>
                                <Input
                                    id="serviceName"
                                    type="text"
                                    value={serviceName}
                                    onChange={(e) =>
                                        setServiceName(e.target.value)
                                    }
                                    placeholder="My Minecraft Server"
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="product" required>
                                    Product
                                </InputLabel>
                                <ProductSelect
                                    value={product}
                                    onChange={(productId) =>
                                        setProduct(productId)
                                    }
                                    required
                                    includeHidden={false}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="serviceOwnerId" required>
                                    Service Owner
                                </InputLabel>
                                <UserSearchSelect
                                    value={serviceOwnerId}
                                    onSelect={handleUserSelect}
                                    placeholder="Search by username or email..."
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" required>
                                    Status
                                </InputLabel>
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
                                    ]}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="monthlyPrice" required>
                                    Monthly Price ($)
                                </InputLabel>
                                <Input
                                    id="monthlyPrice"
                                    type="number"
                                    step="0.01"
                                    value={monthlyPrice}
                                    onChange={(e) =>
                                        setMonthlyPrice(
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    placeholder="9.99"
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="dueDate" required>
                                    Due Date
                                </InputLabel>
                                <DatePicker
                                    id="dueDate"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="location" required>
                                    Location
                                </InputLabel>
                                <Input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(e.target.value)
                                    }
                                    placeholder="US East"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Service Options
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <Checkbox
                                    checked={dedicatedIp}
                                    onChange={(e) =>
                                        setDedicatedIp(e.target.checked)
                                    }
                                    label="Dedicated IP"
                                />
                                <p className="mt-1 ml-8 text-xs text-zinc-500">
                                    Enable dedicated IP address for this service
                                </p>
                            </div>

                            <div>
                                <Checkbox
                                    checked={proxyAddon}
                                    onChange={(e) =>
                                        setProxyAddon(e.target.checked)
                                    }
                                    label="Proxy Addon"
                                />
                                <p className="mt-1 ml-8 text-xs text-zinc-500">
                                    Enable proxy addon (Minecraft servers only)
                                </p>
                            </div>

                            <div>
                                <Checkbox
                                    checked={creationError}
                                    onChange={(e) =>
                                        setCreationError(e.target.checked)
                                    }
                                    label="Creation Error"
                                />
                                <p className="mt-1 ml-8 text-xs text-zinc-500">
                                    Mark this service as having a creation error
                                </p>
                            </div>
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
                            Create Service
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
