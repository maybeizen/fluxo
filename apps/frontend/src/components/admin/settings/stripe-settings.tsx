import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'

interface StripeSettingsProps {
    formData: {
        stripeSecretKey: string
        stripePublishableKey: string
    }
    onChange: (data: Partial<StripeSettingsProps['formData']>) => void
}

export default function StripeSettings({
    formData,
    onChange,
}: StripeSettingsProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                    Stripe Configuration
                </h3>
                <p className="text-sm text-zinc-400">
                    Configure your Stripe payment gateway credentials
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <InputLabel htmlFor="stripePublishableKey">
                        Publishable Key
                    </InputLabel>
                    <Input
                        id="stripePublishableKey"
                        type="text"
                        value={formData.stripePublishableKey}
                        onChange={(e) =>
                            onChange({
                                stripePublishableKey: e.target.value,
                            })
                        }
                        placeholder="pk_test_..."
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                        Your Stripe publishable API key (starts with pk_)
                    </p>
                </div>
                <div>
                    <InputLabel htmlFor="stripeSecretKey">
                        Secret Key
                    </InputLabel>
                    <Input
                        id="stripeSecretKey"
                        type="password"
                        value={formData.stripeSecretKey}
                        onChange={(e) =>
                            onChange({
                                stripeSecretKey: e.target.value,
                            })
                        }
                        placeholder="sk_test_..."
                    />
                    <div className="mt-2 flex items-center gap-2 text-green-500">
                        <p className="text-xs">Securely encrypted</p>
                        <i className="fas fa-lock text-xs"></i>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                        Your Stripe secret API key (starts with sk_). Leave
                        blank to keep current value.
                    </p>
                </div>
            </div>
        </div>
    )
}
