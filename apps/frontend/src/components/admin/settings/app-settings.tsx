'use client'

import React, { useState, useRef } from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Button from '@/components/ui/button'
import { uploadLogo } from '@/lib/admin/settings'
import { useNotifications } from '@/context/notification-context'
import Spinner from '@/components/ui/spinner'

interface AppSettingsProps {
    formData: {
        appName: string
        appBaseUrl: string
        logoUrl: string
    }
    onChange: (data: Partial<AppSettingsProps['formData']>) => void
}

export default function AppSettings({ formData, onChange }: AppSettingsProps) {
    const notifications = useNotifications()
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            notifications.error('Please upload an image file')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            notifications.error('Image must be less than 2MB')
            return
        }

        try {
            setIsUploading(true)
            const logoUrl = await uploadLogo(file)
            onChange({ logoUrl })
            notifications.success('Logo uploaded successfully')
        } catch (error: unknown) {
            notifications.error(
                (error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined) || 'Failed to upload logo'
            )
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div>
            <h2 className="mb-6 text-xl font-semibold text-white">
                Application Settings
            </h2>
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="appName">
                            Application Name
                        </InputLabel>
                        <Input
                            id="appName"
                            type="text"
                            value={formData.appName}
                            onChange={(e) =>
                                onChange({ appName: e.target.value })
                            }
                            placeholder="Fluxo"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="appBaseUrl">Base URL</InputLabel>
                        <Input
                            id="appBaseUrl"
                            type="url"
                            value={formData.appBaseUrl}
                            onChange={(e) =>
                                onChange({ appBaseUrl: e.target.value })
                            }
                            placeholder="https://billing.myhost.com"
                        />
                    </div>
                </div>

                <div>
                    <InputLabel>Logo</InputLabel>
                    <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                            {formData.logoUrl ? (
                                <img
                                    src={formData.logoUrl}
                                    alt="Logo"
                                    className="h-full w-full object-contain p-2"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-zinc-500">
                                    <i className="fas fa-image text-2xl"></i>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="logo-upload"
                                disabled={isUploading}
                            />
                            <label htmlFor="logo-upload">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    icon="fas fa-upload"
                                    loading={isUploading}
                                    className="cursor-pointer"
                                >
                                    Upload Logo
                                </Button>
                            </label>
                            <p className="mt-2 text-sm text-zinc-400">
                                PNG, JPG, SVG, or WEBP. Max 2MB
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
