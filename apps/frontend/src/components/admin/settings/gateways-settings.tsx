'use client'

import React, { useState } from 'react'
import StripeSettings from './stripe-settings'
import Button from '@/components/ui/button'

type GatewayType = 'stripe' | 'paypal'

interface GatewaysSettingsProps {
    formData: {
        stripeSecretKey: string
        stripePublishableKey: string
    }
    onFormDataChange: (
        updates: Partial<GatewaysSettingsProps['formData']>
    ) => void
    onSubmit: (e: React.FormEvent) => void
    isSaving: boolean
}

const gatewayTabs = [
    {
        id: 'stripe' as GatewayType,
        label: 'Stripe',
        icon: 'fab fa-stripe',
        description: 'Credit card and digital wallet payments',
        enabled: true,
    },
    {
        id: 'paypal' as GatewayType,
        label: 'PayPal',
        icon: 'fab fa-paypal',
        description: 'PayPal and Venmo payments',
        enabled: false,
    },
]

export default function GatewaysSettings({
    formData,
    onFormDataChange,
    onSubmit,
    isSaving,
}: GatewaysSettingsProps) {
    const [activeGateway, setActiveGateway] = useState<GatewayType>('stripe')

    return (
        <div className="space-y-8">
            <div>
                <h2 className="mb-6 text-xl font-semibold text-white">
                    Payment Gateways
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {gatewayTabs.map((tab) => {
                        const isDisabled = !tab.enabled
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    if (!isDisabled) {
                                        setActiveGateway(tab.id)
                                    }
                                }}
                                disabled={isDisabled}
                                className={`group relative rounded-lg border p-4 text-left transition-all duration-200 ${
                                    isDisabled
                                        ? 'cursor-not-allowed opacity-50'
                                        : activeGateway === tab.id
                                          ? 'border-primary-400/50 bg-primary-400/5'
                                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                            isDisabled
                                                ? 'bg-zinc-800 text-zinc-600'
                                                : activeGateway === tab.id
                                                  ? 'bg-primary-400/20 text-primary-400'
                                                  : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'
                                        }`}
                                    >
                                        <i
                                            className={`${tab.icon} text-lg`}
                                        ></i>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className={`font-semibold ${
                                                    isDisabled
                                                        ? 'text-zinc-500'
                                                        : activeGateway ===
                                                            tab.id
                                                          ? 'text-primary-400'
                                                          : 'text-white'
                                                }`}
                                            >
                                                {tab.label}
                                            </h3>
                                            {isDisabled && (
                                                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
                                                    Coming Soon
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-zinc-400">
                                            {tab.description}
                                        </p>
                                    </div>
                                    {activeGateway === tab.id &&
                                        !isDisabled && (
                                            <div className="flex-shrink-0">
                                                <div className="bg-primary-400 h-2 w-2 rounded-full"></div>
                                            </div>
                                        )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="border-t border-zinc-800 pt-8">
                {activeGateway === 'stripe' && (
                    <form onSubmit={onSubmit} className="space-y-6">
                        <StripeSettings
                            formData={formData}
                            onChange={onFormDataChange}
                        />
                        <div className="flex items-center gap-4 border-t border-zinc-800 pt-6">
                            <Button
                                type="submit"
                                variant="custom"
                                className="bg-green-600 hover:bg-green-700"
                                loading={isSaving}
                            >
                                {isSaving
                                    ? 'Saving...'
                                    : 'Save Stripe Settings'}
                            </Button>
                        </div>
                    </form>
                )}

                {activeGateway === 'paypal' && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                            <i className="fab fa-paypal text-3xl text-zinc-600"></i>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-white">
                            PayPal Integration
                        </h3>
                        <p className="mb-4 text-sm text-zinc-400">
                            PayPal payment gateway integration is coming soon.
                            Check back later for updates.
                        </p>
                        <span className="bg-primary-400/10 text-primary-400 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                            <i className="fas fa-clock"></i>
                            Coming Soon
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
