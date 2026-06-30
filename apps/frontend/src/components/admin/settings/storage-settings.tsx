import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'

interface StorageSettingsProps {
    formData: {
        storageProvider: 'local' | 's3'
        s3Endpoint: string
        s3Region: string
        s3Bucket: string
        s3AccessKeyId: string
        s3SecretAccessKey: string
        s3ForcePathStyle: boolean
        s3PublicUrlBase: string
    }
    onChange: (data: Partial<StorageSettingsProps['formData']>) => void
}

export default function StorageSettings({
    formData,
    onChange,
}: StorageSettingsProps) {
    return (
        <div>
            <h2 className="mb-6 text-xl font-semibold text-white">
                Storage Settings
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                    <InputLabel htmlFor="storageProvider">
                        Storage Provider
                    </InputLabel>
                    <select
                        id="storageProvider"
                        value={formData.storageProvider}
                        onChange={(e) =>
                            onChange({
                                storageProvider: e.target.value as
                                    | 'local'
                                    | 's3',
                            })
                        }
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white focus:border-primary-400 focus:outline-none"
                    >
                        <option value="local">Local (disk)</option>
                        <option value="s3">S3-compatible</option>
                    </select>
                    <p className="mt-2 text-xs text-zinc-500">
                        Local storage saves files under /storage and serves them
                        from the API. S3 stores files in a compatible object
                        store (AWS S3, R2, MinIO, etc.).
                    </p>
                </div>

                {formData.storageProvider === 's3' && (
                    <>
                        <div>
                            <InputLabel htmlFor="s3Endpoint">
                                Endpoint (optional)
                            </InputLabel>
                            <Input
                                id="s3Endpoint"
                                type="text"
                                value={formData.s3Endpoint}
                                onChange={(e) =>
                                    onChange({ s3Endpoint: e.target.value })
                                }
                                placeholder="https://s3.amazonaws.com"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="s3Region">Region</InputLabel>
                            <Input
                                id="s3Region"
                                type="text"
                                value={formData.s3Region}
                                onChange={(e) =>
                                    onChange({ s3Region: e.target.value })
                                }
                                placeholder="us-east-1"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="s3Bucket">Bucket</InputLabel>
                            <Input
                                id="s3Bucket"
                                type="text"
                                value={formData.s3Bucket}
                                onChange={(e) =>
                                    onChange({ s3Bucket: e.target.value })
                                }
                                placeholder="my-bucket"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="s3PublicUrlBase">
                                Public URL Base (optional)
                            </InputLabel>
                            <Input
                                id="s3PublicUrlBase"
                                type="text"
                                value={formData.s3PublicUrlBase}
                                onChange={(e) =>
                                    onChange({
                                        s3PublicUrlBase: e.target.value,
                                    })
                                }
                                placeholder="https://cdn.example.com"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="s3AccessKeyId">
                                Access Key ID
                            </InputLabel>
                            <Input
                                id="s3AccessKeyId"
                                type="password"
                                value={formData.s3AccessKeyId}
                                onChange={(e) =>
                                    onChange({
                                        s3AccessKeyId: e.target.value,
                                    })
                                }
                                placeholder="Access key"
                            />
                            <div className="mt-2 flex items-center gap-2 text-green-500">
                                <p className="text-xs">Securely encrypted</p>
                                <i className="fas fa-lock text-xs"></i>
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="s3SecretAccessKey">
                                Secret Access Key
                            </InputLabel>
                            <Input
                                id="s3SecretAccessKey"
                                type="password"
                                value={formData.s3SecretAccessKey}
                                onChange={(e) =>
                                    onChange({
                                        s3SecretAccessKey: e.target.value,
                                    })
                                }
                                placeholder="Secret key"
                            />
                            <div className="mt-2 flex items-center gap-2 text-green-500">
                                <p className="text-xs">Securely encrypted</p>
                                <i className="fas fa-lock text-xs"></i>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.s3ForcePathStyle}
                                    onChange={(e) =>
                                        onChange({
                                            s3ForcePathStyle: e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-primary-400 focus:ring-primary-400"
                                />
                                <span className="text-sm text-zinc-300">
                                    Force path-style URLs (required for MinIO,
                                    R2, and some S3-compatible providers)
                                </span>
                            </label>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
