'use client'

import React, { useMemo, memo } from 'react'
import Link from 'next/link'
import { Service as ServiceType, ServiceStatus } from '@fluxo/types'
import { formatPrice, formatShortDate } from '@/utils/formatting'
import { ServiceStatusBadge } from '@/utils/status-badges'

interface ServiceCardProps {
    service: ServiceType
}

function ServiceCard({ service }: ServiceCardProps) {
    const backgroundImage = useMemo(() => {
        const hash = service.uuid
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const imageNumber = (hash % 6) + 1
        return `/service${imageNumber}.png`
    }, [service.uuid])

    return (
        <Link href={`/client/services/${service.uuid}`}>
            <div className="group relative h-44 cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]">
                <div
                    className="absolute inset-0 bg-cover bg-center brightness-50 transition-all group-hover:brightness-60"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h3 className="mb-0.5 text-lg font-semibold text-white">
                                {service.serviceName}
                            </h3>
                            <p className="text-xs text-zinc-400">
                                Service #{service.uuid.slice(-4)}
                            </p>
                        </div>
                        <ServiceStatusBadge status={service.status} />
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                        <div>
                            <p className="mb-0.5 text-xs tracking-wider text-zinc-400 uppercase">
                                Price
                            </p>
                            <p className="text-lg font-bold text-white">
                                {formatPrice(service.monthlyPrice)}
                                <span className="ml-1 text-xs font-normal text-zinc-400">
                                    / MONTH
                                </span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="mb-0.5 text-xs tracking-wider text-zinc-400 uppercase">
                                Expires
                            </p>
                            <p className="text-sm font-semibold text-white">
                                {formatShortDate(service.dueDate)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default memo(ServiceCard)
