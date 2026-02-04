import React, { useState } from 'react'
import { ServiceStatus } from '@fluxo/types'

interface ServiceHeaderProps {
    serviceName: string
    product: string
    status: ServiceStatus
    externalId?: string
}

export const ServiceHeader: React.FC<ServiceHeaderProps> = ({
    serviceName,
    product,
    status,
    externalId,
}) => {
    const [bgImage] = useState(() => {
        const imageNumber = Math.floor(Math.random() * 6) + 1
        return `/service${imageNumber}.png`
    })

    const getStatusConfig = () => {
        switch (status) {
            case ServiceStatus.ACTIVE:
                return {
                    label: 'Active',
                    color: 'text-green-400',
                    bgGlow: 'bg-green-500/20',
                    borderGlow: 'border-green-500/30',
                    icon: 'fa-circle-check',
                }
            case ServiceStatus.SUSPENDED:
                return {
                    label: 'Suspended',
                    color: 'text-yellow-400',
                    bgGlow: 'bg-yellow-500/20',
                    borderGlow: 'border-yellow-500/30',
                    icon: 'fa-circle-pause',
                }
            case ServiceStatus.CANCELLED:
                return {
                    label: 'Cancelled',
                    color: 'text-primary-300',
                    bgGlow: 'bg-primary-400/20',
                    borderGlow: 'border-primary-400/30',
                    icon: 'fa-circle-xmark',
                }
            default:
                return {
                    label: 'Unknown',
                    color: 'text-zinc-400',
                    bgGlow: 'bg-zinc-500/20',
                    borderGlow: 'border-zinc-500/30',
                    icon: 'fa-circle-question',
                }
        }
    }

    const statusConfig = getStatusConfig()

    return (
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/85 to-black/90"></div>

            <div
                className={`absolute top-0 right-0 h-96 w-96 ${statusConfig.bgGlow} rounded-full opacity-30 blur-3xl`}
            ></div>

            <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-white">
                                {serviceName}
                            </h1>
                            <div
                                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${statusConfig.borderGlow} ${statusConfig.bgGlow}`}
                            >
                                <i
                                    className={`fas ${statusConfig.icon} ${statusConfig.color} text-sm`}
                                ></i>
                                <span
                                    className={`text-sm font-semibold ${statusConfig.color}`}
                                >
                                    {statusConfig.label}
                                </span>
                            </div>
                        </div>
                        <p className="text-lg text-zinc-400">{product}</p>
                    </div>
                </div>

                {externalId && (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-2 backdrop-blur-sm">
                        <i className="fas fa-fingerprint text-sm text-zinc-500"></i>
                        <span className="text-xs tracking-wider text-zinc-500 uppercase">
                            Server ID:
                        </span>
                        <code className="font-mono text-sm text-zinc-300">
                            {externalId}
                        </code>
                    </div>
                )}
            </div>
        </div>
    )
}
