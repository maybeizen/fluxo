import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Checkbox from '@/components/ui/input/checkbox'

interface SecuritySettingsProps {
    formData: {
        cloudflareTurnstileEnabled: boolean
        cloudflareTurnstileSiteKey: string
        cloudflareTurnstileSecretKey: string
    }
    onChange: (data: Partial<SecuritySettingsProps['formData']>) => void
}

export default function SecuritySettings({
    formData,
    onChange,
}: SecuritySettingsProps) {
    return (
        <div>
            <h2 className="mb-6 text-xl font-semibold text-white">
                Security Settings
            </h2>
            <div className="space-y-6">
                <div>
                    <h3 className="mb-4 text-lg font-medium text-white">
                        Cloudflare Turnstile
                    </h3>
                    <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <InputLabel
                                        htmlFor="cloudflareTurnstileEnabled"
                                        className="mb-0"
                                    >
                                        Enable Cloudflare Turnstile
                                    </InputLabel>
                                </div>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Enable Cloudflare Turnstile for bot
                                    protection on login and registration forms
                                </p>
                            </div>
                            <Checkbox
                                id="cloudflareTurnstileEnabled"
                                checked={formData.cloudflareTurnstileEnabled}
                                onChange={(e) =>
                                    onChange({
                                        cloudflareTurnstileEnabled:
                                            e.target.checked,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {formData.cloudflareTurnstileEnabled && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="cloudflareTurnstileSiteKey">
                                    Site Key
                                </InputLabel>
                                <Input
                                    id="cloudflareTurnstileSiteKey"
                                    type="text"
                                    value={formData.cloudflareTurnstileSiteKey}
                                    onChange={(e) =>
                                        onChange({
                                            cloudflareTurnstileSiteKey:
                                                e.target.value,
                                        })
                                    }
                                    placeholder="Your Cloudflare Turnstile Site Key"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="cloudflareTurnstileSecretKey">
                                    Secret Key
                                </InputLabel>
                                <Input
                                    id="cloudflareTurnstileSecretKey"
                                    type="password"
                                    value={
                                        formData.cloudflareTurnstileSecretKey
                                    }
                                    onChange={(e) =>
                                        onChange({
                                            cloudflareTurnstileSecretKey:
                                                e.target.value,
                                        })
                                    }
                                    placeholder="Your Cloudflare Turnstile Secret Key"
                                />

                                <div className="mt-2 flex items-center gap-2 text-green-500">
                                    <p className="text-xs">
                                        Securely encrypted
                                    </p>
                                    <i className="fas fa-lock text-xs"></i>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
