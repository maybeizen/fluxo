import React from 'react'

interface ManageTabProps {
    serviceId: string
    hasCreationError: boolean
}

export const ManageTab: React.FC<ManageTabProps> = ({
    serviceId,
    hasCreationError,
}) => {
    const actions = [
        {
            id: 'console',
            title: 'Server Console',
            description: 'Access your server terminal and execute commands',
            icon: 'fa-terminal',
            iconColor: 'text-blue-400',
            iconBg: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            onClick: () => console.log('Console', serviceId),
        },
        {
            id: 'files',
            title: 'File Manager',
            description: 'Browse, edit, and manage your server files',
            icon: 'fa-folder-open',
            iconColor: 'text-purple-400',
            iconBg: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
            onClick: () => console.log('Files', serviceId),
        },
        {
            id: 'settings',
            title: 'Server Settings',
            description: 'Configure server properties and advanced options',
            icon: 'fa-sliders',
            iconColor: 'text-orange-400',
            iconBg: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20',
            onClick: () => console.log('Settings', serviceId),
        },
        {
            id: 'backup',
            title: 'Backups',
            description: 'Create and restore server backups',
            icon: 'fa-database',
            iconColor: 'text-green-400',
            iconBg: 'bg-green-500/10',
            borderColor: 'border-green-500/20',
            onClick: () => console.log('Backup', serviceId),
        },
    ]

    if (hasCreationError) {
        return (
            <div className="border-primary-800/50 from-primary-900/40 to-primary-900/10 rounded-xl border bg-gradient-to-br p-8">
                <div className="flex items-start gap-4">
                    <div className="bg-primary-400/20 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl">
                        <i className="fas fa-triangle-exclamation text-primary-300 text-2xl"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="mb-2 text-xl font-semibold text-white">
                            Service Unavailable
                        </h3>
                        <p className="mb-4 text-zinc-400">
                            Your service encountered an error during creation
                            and management functions are currently disabled.
                        </p>
                        <button className="bg-primary-400/20 hover:bg-primary-400/30 border-primary-600/50 text-primary-200 rounded-lg border px-4 py-2 text-sm font-medium transition-all">
                            <i className="fas fa-headset mr-2"></i>
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {actions.map((action) => (
                <button
                    key={action.id}
                    onClick={action.onClick}
                    className={`group relative border bg-zinc-900/50 backdrop-blur-sm ${action.borderColor} rounded-xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg`}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className={`h-14 w-14 rounded-xl ${action.iconBg} flex flex-shrink-0 items-center justify-center transition-transform group-hover:scale-110`}
                        >
                            <i
                                className={`fas ${action.icon} ${action.iconColor} text-xl`}
                            ></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="mb-1 flex items-center gap-2 text-lg font-semibold text-white">
                                {action.title}
                                <i className="fas fa-arrow-right text-xs text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-zinc-400"></i>
                            </h4>
                            <p className="text-sm text-zinc-400">
                                {action.description}
                            </p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    )
}
