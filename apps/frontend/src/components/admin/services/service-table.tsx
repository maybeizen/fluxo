'use client'

import React from 'react'
import { Service, ServiceStatus } from '@fluxo/types'
import Button from '@/components/ui/button'
import Link from 'next/link'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'

export interface ServiceOwner {
    uuid: string
    username: string | null
    email: string
    name: string | null
}

export interface ServiceWithOwner extends Service {
    owner: ServiceOwner | null
    productName?: string
}

interface ServiceTableProps {
    services: ServiceWithOwner[]
    isLoading?: boolean
    onEdit?: (serviceId: string) => void
    onDelete?: (serviceId: string) => void
    className?: string
}

export default function ServiceTable({
    services,
    isLoading = false,
    onEdit,
    onDelete,
    className = '',
}: ServiceTableProps) {
    const notifications = useNotifications()

    const handleCopyId = async (serviceId: string) => {
        try {
            await navigator.clipboard.writeText(serviceId)
            notifications.success('Service ID copied to clipboard')
        } catch (error) {
            console.error('Failed to copy ID:', error)
            notifications.error('Failed to copy ID')
        }
    }

    const getStatusBadge = (status: ServiceStatus) => {
        const colors = {
            [ServiceStatus.ACTIVE]:
                'bg-green-500/10 text-green-500 border-green-500/20',
            [ServiceStatus.SUSPENDED]:
                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            [ServiceStatus.CANCELLED]:
                'bg-primary-400/10 text-primary-400 border-primary-400/20',
            [ServiceStatus.DELETED]:
                'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        }

        return (
            <span
                className={`rounded border px-2 py-1 text-xs font-medium ${colors[status]}`}
            >
                {status}
            </span>
        )
    }

    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`
    }

    const formatDate = (date: Date | string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
            </div>
        )
    }

    if (services.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                    <i className="fas fa-server text-2xl text-zinc-600"></i>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                    No Services Found
                </h3>
                <p className="max-w-md text-sm text-zinc-400">
                    No services match your current filters. Try adjusting your
                    search criteria.
                </p>
            </div>
        )
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-zinc-800">
                        <th className="w-24 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Service
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Owner
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Product
                        </th>
                        <th className="w-28 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Status
                        </th>
                        <th className="w-28 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Price
                        </th>
                        <th className="w-28 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Location
                        </th>
                        <th className="w-32 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Due Date
                        </th>
                        <th className="w-28 px-4 py-3 text-right text-sm font-medium text-zinc-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service, index) => (
                        <tr
                            key={service.uuid || `service-${index}`}
                            className="border-b border-zinc-900 transition-colors hover:bg-zinc-900/50"
                        >
                            <td className="px-4 py-3">
                                <div
                                    className="group flex w-fit cursor-pointer items-center gap-2 transition-colors hover:text-white"
                                    onClick={() => handleCopyId(service.uuid)}
                                    title="Click to copy ID"
                                >
                                    <span className="font-mono text-xs text-zinc-400 group-hover:text-white">
                                        {service.uuid}
                                    </span>
                                    <i className="fas fa-copy flex-shrink-0 text-xs text-zinc-600 group-hover:text-zinc-400"></i>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-col">
                                    <Link
                                        href={`/admin/services/${service.uuid}/edit`}
                                        className="hover:text-primary-400 truncate text-sm font-medium text-white transition-colors"
                                    >
                                        {service.serviceName}
                                    </Link>
                                    <span className="truncate text-xs text-zinc-500">
                                        {service.externalId
                                            ? `External: ${service.externalId}`
                                            : 'No external ID'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-col">
                                    <div className="text-sm font-medium text-white">
                                        {service.owner?.username ||
                                            service.owner?.name ||
                                            'Unknown User'}
                                    </div>
                                    {service.owner?.email && (
                                        <div className="max-w-[150px] truncate text-xs text-zinc-500">
                                            {service.owner.email}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                                {service.productName || service.product}
                            </td>
                            <td className="px-4 py-3">
                                {getStatusBadge(service.status)}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-zinc-400">
                                {formatPrice(service.monthlyPrice)}/mo
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                                {service.location}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                                {formatDate(service.dueDate)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(service.uuid)}
                                            className="px-3"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="fail"
                                            size="sm"
                                            onClick={() =>
                                                onDelete(service.uuid)
                                            }
                                            className="px-3"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
