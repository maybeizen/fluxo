import React from 'react'
import Checkbox from '@/components/ui/input/checkbox'

interface AuthSettingsProps {
    formData: {
        authDisableEmailVerification: boolean
        authDisableRegistration: boolean
        authDisableLogin: boolean
        authDisablePasswordChange: boolean
    }
    onChange: (data: Partial<AuthSettingsProps['formData']>) => void
}

export default function AuthSettings({
    formData,
    onChange,
}: AuthSettingsProps) {
    return (
        <div>
            <h2 className="mb-6 text-xl font-semibold text-white">
                Authentication Settings
            </h2>
            <div className="space-y-3">
                <Checkbox
                    id="authDisableEmailVerification"
                    checked={formData.authDisableEmailVerification}
                    onChange={(e) =>
                        onChange({
                            authDisableEmailVerification: e.target.checked,
                        })
                    }
                    label="Disable Email Verification"
                />
                <Checkbox
                    id="authDisableRegistration"
                    checked={formData.authDisableRegistration}
                    onChange={(e) =>
                        onChange({ authDisableRegistration: e.target.checked })
                    }
                    label="Disable Registration"
                />
                <Checkbox
                    id="authDisableLogin"
                    checked={formData.authDisableLogin}
                    onChange={(e) =>
                        onChange({ authDisableLogin: e.target.checked })
                    }
                    label="Disable Login"
                />
                <Checkbox
                    id="authDisablePasswordChange"
                    checked={formData.authDisablePasswordChange}
                    onChange={(e) =>
                        onChange({
                            authDisablePasswordChange: e.target.checked,
                        })
                    }
                    label="Disable Password Change"
                />
            </div>
        </div>
    )
}
