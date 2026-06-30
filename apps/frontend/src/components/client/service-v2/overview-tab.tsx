import React from 'react'

interface OverviewTabProps {
    serviceName: string
    dedicatedIp: boolean
    proxyAddon: boolean
    status: string
    diagnosticsMessage: string
    hasCreationError: boolean
    onSaveServiceName: (name: string) => Promise<void>
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
    dedicatedIp,
    proxyAddon,
    status,
    diagnosticsMessage,
    hasCreationError,
}) => {
    const getStatusColor = () => {
        if (hasCreationError)
            return {
                text: 'text-primary-300',
                bg: 'bg-primary-400/10',
                border: 'border-primary-400/20',
            }
        if (status === 'operational')
            return {
                text: 'text-green-400',
                bg: 'bg-green-500/10',
                border: 'border-green-500/20',
            }
        if (status === 'degraded')
            return {
                text: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/20',
            }
        return {
            text: 'text-primary-300',
            bg: 'bg-primary-400/10',
            border: 'border-primary-400/20',
        }
    }

    const statusColor = getStatusColor()

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <i className="fas fa-heartbeat text-primary-400"></i>
                    System Status
                </h3>
                <div
                    className={`rounded-lg border p-4 ${statusColor.border} ${statusColor.bg}`}
                >
                    <div className="flex items-start gap-3">
                        <i
                            className={`fas fa-circle text-xs ${statusColor.text} mt-1`}
                        ></i>
                        <div className="flex-1">
                            <p
                                className={`font-medium ${statusColor.text} mb-1`}
                            >
                                {hasCreationError
                                    ? 'Creation Error'
                                    : status === 'operational'
                                      ? 'Operational'
                                      : status === 'degraded'
                                        ? 'Degraded'
                                        : 'Offline'}
                            </p>
                            <p className="text-sm text-zinc-400">
                                {diagnosticsMessage}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <i className="fas fa-puzzle-piece text-purple-500"></i>
                    Add-ons & Features
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border border-zinc-700/30 bg-zinc-800/30 p-4">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${dedicatedIp ? 'bg-green-500/10' : 'bg-zinc-700/30'}`}
                        >
                            <i
                                className={`fas fa-network-wired ${dedicatedIp ? 'text-green-400' : 'text-zinc-500'}`}
                            ></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">
                                Dedicated IP
                            </p>
                            <p className="text-xs text-zinc-500">
                                {dedicatedIp ? 'Enabled' : 'Not enabled'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-zinc-700/30 bg-zinc-800/30 p-4">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${proxyAddon ? 'bg-green-500/10' : 'bg-zinc-700/30'}`}
                        >
                            <i
                                className={`fas fa-shield-halved ${proxyAddon ? 'text-green-400' : 'text-zinc-500'}`}
                            ></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">
                                Proxy Setup
                            </p>
                            <p className="text-xs text-zinc-500">
                                {proxyAddon ? 'Enabled' : 'Not enabled'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
