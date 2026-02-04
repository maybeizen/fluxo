import React, { useState } from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Button from '@/components/ui/button'
import { sendTestEmail } from '@/lib/admin/settings'
import { useNotifications } from '@/context/notification-context'

interface EmailSettingsProps {
    formData: {
        emailSmtpHost: string
        emailSmtpPort: string
        emailSmtpUser: string
        emailSmtpPass: string
        emailFrom: string
    }
    onChange: (data: Partial<EmailSettingsProps['formData']>) => void
}

export default function EmailSettings({
    formData,
    onChange,
}: EmailSettingsProps) {
    const notifications = useNotifications()
    const [testEmail, setTestEmail] = useState('')
    const [isSendingTest, setIsSendingTest] = useState(false)

    const handleSendTestEmail = async () => {
        if (!testEmail) {
            notifications.error('Please enter an email address')
            return
        }

        setIsSendingTest(true)
        const result = await sendTestEmail(testEmail)

        if (result.success) {
            notifications.success(
                result.message || 'Test email sent successfully'
            )
            setTestEmail('')
        } else {
            notifications.error(result.message || 'Failed to send test email')
        }

        setIsSendingTest(false)
    }
    return (
        <div>
            <h2 className="mb-6 text-xl font-semibold text-white">
                Email (SMTP) Settings
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <InputLabel htmlFor="emailSmtpHost">SMTP Host</InputLabel>
                    <Input
                        id="emailSmtpHost"
                        type="text"
                        value={formData.emailSmtpHost}
                        onChange={(e) =>
                            onChange({ emailSmtpHost: e.target.value })
                        }
                        placeholder="smtp.gmail.com"
                    />
                </div>
                <div>
                    <InputLabel htmlFor="emailSmtpPort">SMTP Port</InputLabel>
                    <Input
                        id="emailSmtpPort"
                        type="number"
                        value={formData.emailSmtpPort}
                        onChange={(e) =>
                            onChange({ emailSmtpPort: e.target.value })
                        }
                        placeholder="587"
                    />
                </div>
                <div>
                    <InputLabel htmlFor="emailSmtpUser">
                        SMTP Username
                    </InputLabel>
                    <Input
                        id="emailSmtpUser"
                        type="text"
                        value={formData.emailSmtpUser}
                        onChange={(e) =>
                            onChange({ emailSmtpUser: e.target.value })
                        }
                        placeholder="your-email@gmail.com"
                    />
                </div>
                <div>
                    <InputLabel htmlFor="emailSmtpPass">
                        SMTP Password
                    </InputLabel>

                    <Input
                        id="emailSmtpPass"
                        type="password"
                        value={formData.emailSmtpPass}
                        onChange={(e) =>
                            onChange({ emailSmtpPass: e.target.value })
                        }
                        placeholder="Your SMTP password"
                    />

                    <div className="mt-2 flex items-center gap-2 text-green-500">
                        <p className="text-xs">Securely encrypted</p>
                        <i className="fas fa-lock text-xs"></i>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <InputLabel htmlFor="emailFrom">From Email</InputLabel>
                    <Input
                        id="emailFrom"
                        type="email"
                        value={formData.emailFrom}
                        onChange={(e) =>
                            onChange({ emailFrom: e.target.value })
                        }
                        placeholder="no-reply@myhost.com"
                    />
                </div>
            </div>

            <div className="mt-6 border-t border-zinc-800 pt-6">
                <h3 className="mb-4 text-lg font-medium text-white">
                    Test Email Configuration
                </h3>
                <p className="mb-4 text-sm text-zinc-400">
                    Send a test email to verify your SMTP configuration is
                    working correctly.
                </p>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            id="testEmail"
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="recipient@example.com"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="custom"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleSendTestEmail}
                        loading={isSendingTest}
                        disabled={isSendingTest}
                        icon="fas fa-paper-plane"
                    >
                        {isSendingTest ? 'Sending...' : 'Send Test Email'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
