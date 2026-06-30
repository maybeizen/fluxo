import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'

interface DiscordSettingsProps {
    formData: {
        discordClientId: string
        discordClientSecret: string
        discordRedirectUri: string
    }
    onChange: (data: Partial<DiscordSettingsProps['formData']>) => void
}

export default function DiscordSettings({
    formData,
    onChange,
}: DiscordSettingsProps) {
    return (
        <div>
            <h2 className="mb-6 text-xl font-semibold text-white">
                Discord OAuth Settings
            </h2>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <InputLabel htmlFor="discordClientId">Client ID</InputLabel>
                    <Input
                        id="discordClientId"
                        type="text"
                        value={formData.discordClientId}
                        onChange={(e) =>
                            onChange({ discordClientId: e.target.value })
                        }
                        placeholder="Your Discord Application Client ID"
                    />
                </div>
                <div>
                    <InputLabel htmlFor="discordClientSecret">
                        Client Secret
                    </InputLabel>
                    <Input
                        id="discordClientSecret"
                        type="password"
                        value={formData.discordClientSecret}
                        onChange={(e) =>
                            onChange({ discordClientSecret: e.target.value })
                        }
                        placeholder="Your Discord Application Client Secret"
                    />

                    <div className="mt-2 flex items-center gap-2 text-green-500">
                        <p className="text-xs">Securely encrypted</p>
                        <i className="fas fa-lock text-xs"></i>
                    </div>
                </div>
                <div>
                    <InputLabel htmlFor="discordRedirectUri">
                        Redirect URI
                    </InputLabel>
                    <Input
                        id="discordRedirectUri"
                        type="url"
                        value={formData.discordRedirectUri}
                        onChange={(e) =>
                            onChange({ discordRedirectUri: e.target.value })
                        }
                        placeholder="https://billing.myhost.com/api/v1/discord/callback"
                    />
                </div>
            </div>
        </div>
    )
}
