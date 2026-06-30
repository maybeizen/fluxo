import React from 'react'

interface ManageTabProps {
    serviceId: string
    hasCreationError: boolean
}

export const ManageTab: React.FC<ManageTabProps> = ({ hasCreationError }) => {
    if (hasCreationError) {
        return (
            <div className="border-primary-800/50 from-primary-900/40 to-primary-900/10 rounded-xl border bg-gradient-to-br p-8">
                <div className="flex items-start gap-4">
                    <div className="bg-primary-400/20 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl">
                        <i className="fas fa-triangle-exclamation text-primary-300 text-2xl"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-foreground mb-2 text-xl font-semibold">
                            Service Unavailable
                        </h3>
                        <p className="text-muted mb-4">
                            Your service encountered an error during creation
                            and management functions are currently disabled.
                        </p>
                        <a
                            href="/client/support"
                            className="bg-primary-400/20 hover:bg-primary-400/30 border-primary-600/50 text-primary-200 inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-all"
                        >
                            <i className="fas fa-headset mr-2"></i>
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="border-border bg-surface/50 rounded-xl border p-8 text-center">
            <div className="bg-surface mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <i
                    className="fas fa-screwdriver-wrench text-muted text-xl"
                    aria-hidden="true"
                />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
                Server management coming soon
            </h3>
            <p className="text-muted mx-auto max-w-md text-sm">
                Console, file manager, settings, and backups will be available
                here once your service plugin is fully connected.
            </p>
        </div>
    )
}
