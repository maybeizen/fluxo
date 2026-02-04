import React, { useState } from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Button from '@/components/ui/button'
import { useNotifications } from '@/context/notification-context'

interface SettingsTabProps {
    serviceName: string
    dueDate: Date | string
    status: string
    hasCreationError: boolean
    onSaveServiceName: (name: string) => Promise<void>
    onCancelService: (reason: string) => Promise<void>
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
    serviceName: initialServiceName,
    dueDate,
    status,
    hasCreationError,
    onSaveServiceName,
    onCancelService,
}) => {
    const [serviceName, setServiceName] = useState(initialServiceName)
    const [isLoading, setIsLoading] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancellationReason, setCancellationReason] = useState('')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const notifications = useNotifications()

    const hasChanges = serviceName !== initialServiceName

    const handleSave = async () => {
        if (!hasChanges) {
            notifications.info('No changes to save')
            return
        }

        setIsLoading(true)
        try {
            await onSaveServiceName(serviceName)
            notifications.success('Service name updated successfully')
        } catch (error) {
            notifications.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update service name'
            )
            setServiceName(initialServiceName)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelService = async () => {
        setIsLoading(true)
        try {
            await onCancelService(cancellationReason)
        } catch (error) {
            console.error('Failed to cancel service', error)
            notifications.error('Failed to cancel service')
        } finally {
            setIsLoading(false)
            setShowCancelModal(false)
            setShowConfirmation(false)
        }
    }

    const formatDate = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <i className="fas fa-pen-to-square text-blue-500"></i>
                    Service Name
                </h3>
                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="serviceName">
                            Display Name
                        </InputLabel>
                        <Input
                            id="serviceName"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            placeholder="Enter service name"
                            maxLength={24}
                        />
                        <p className="mt-2 text-xs text-zinc-500">
                            lmao 3-24 characters, alphanumeric. This won&apos;t
                            affect your server panel.
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!hasChanges || isLoading}
                        loading={isLoading}
                        icon="fas fa-save"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>

            {status === 'operational' && !hasCreationError && (
                <div className="rounded-xl border border-red-800/50 bg-gradient-to-br from-red-900/40 to-red-900/10 p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                        <i className="fas fa-triangle-exclamation text-red-400"></i>
                        Danger Zone
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="mb-1 font-medium text-white">
                                    Cancel Service
                                </p>
                                <p className="text-sm text-zinc-400">
                                    Schedule your service for cancellation on
                                    the next due date ({formatDate(dueDate)})
                                </p>
                            </div>
                            <Button
                                variant="fail"
                                onClick={() => setShowCancelModal(true)}
                                icon="fas fa-ban"
                            >
                                Cancel Service
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold text-white">
                            <i className="fas fa-ban text-primary-400"></i>
                            Cancel Service
                        </h3>

                        {!showConfirmation ? (
                            <div className="space-y-4">
                                <p className="text-zinc-400">
                                    Please provide a reason for cancelling your
                                    service. Your service will remain active
                                    until {formatDate(dueDate)}.
                                </p>
                                <div>
                                    <InputLabel htmlFor="cancellationReason">
                                        Cancellation Reason
                                    </InputLabel>
                                    <textarea
                                        id="cancellationReason"
                                        value={cancellationReason}
                                        onChange={(e) =>
                                            setCancellationReason(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Please tell us why you're cancelling... (minimum 10 characters)"
                                        rows={4}
                                        className="focus:border-primary-400/50 focus:ring-primary-400/50 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 transition-all focus:ring-2 focus:outline-none"
                                        minLength={10}
                                        maxLength={500}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        fullWidth
                                        onClick={() =>
                                            setShowCancelModal(false)
                                        }
                                    >
                                        Go Back
                                    </Button>
                                    <Button
                                        variant="fail"
                                        fullWidth
                                        onClick={() =>
                                            setShowConfirmation(true)
                                        }
                                        disabled={
                                            cancellationReason.trim().length <
                                            10
                                        }
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="border-primary-800/50 bg-primary-900/30 rounded-lg border p-4">
                                    <p className="text-primary-200 mb-2 font-medium">
                                        Final Confirmation
                                    </p>
                                    <p className="text-primary-300/80 text-sm">
                                        This will schedule your service for
                                        cancellation. You can contact support
                                        before the due date to reverse this
                                        action.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        fullWidth
                                        onClick={() =>
                                            setShowConfirmation(false)
                                        }
                                        disabled={isLoading}
                                    >
                                        Go Back
                                    </Button>
                                    <Button
                                        variant="fail"
                                        fullWidth
                                        onClick={handleCancelService}
                                        loading={isLoading}
                                        icon="fas fa-check"
                                    >
                                        Confirm Cancellation
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
