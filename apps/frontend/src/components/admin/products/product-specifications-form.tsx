'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'

interface ProductSpecificationsFormProps {
    cpu: number
    setCpu: (value: number) => void
    ram: number
    setRam: (value: number) => void
    storage: number
    setStorage: (value: number) => void
    ports: number
    setPorts: (value: number) => void
    databases: number
    setDatabases: (value: number) => void
    backups: number
    setBackups: (value: number) => void
    errors: Record<string, string>
    validateField?: (
        field: 'cpu' | 'ram' | 'storage' | 'ports' | 'databases' | 'backups',
        value: unknown
    ) => boolean
}

export default function ProductSpecificationsForm({
    cpu,
    setCpu,
    ram,
    setRam,
    storage,
    setStorage,
    ports,
    setPorts,
    databases,
    setDatabases,
    backups,
    setBackups,
    errors,
    validateField,
}: ProductSpecificationsFormProps) {
    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                Specifications
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                    <InputLabel htmlFor="cpu" required>
                        CPU (%)
                    </InputLabel>
                    <Input
                        id="cpu"
                        type="number"
                        step="1"
                        value={cpu}
                        onChange={(e) => setCpu(parseInt(e.target.value) || 0)}
                        onBlur={() => validateField?.('cpu', cpu)}
                        placeholder="100"
                        min="0"
                        required
                    />
                    {errors.cpu && (
                        <p className="text-primary-400 mt-1 text-xs">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.cpu}
                        </p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="ram" required>
                        RAM (MB)
                    </InputLabel>
                    <Input
                        id="ram"
                        type="number"
                        step="1"
                        value={ram}
                        onChange={(e) => setRam(parseInt(e.target.value) || 0)}
                        onBlur={() => validateField?.('ram', ram)}
                        placeholder="1024"
                        min="1"
                        required
                    />
                    {errors.ram && (
                        <p className="text-primary-400 mt-1 text-xs">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.ram}
                        </p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="storage" required>
                        Storage (MB)
                    </InputLabel>
                    <Input
                        id="storage"
                        type="number"
                        step="1"
                        value={storage}
                        onChange={(e) =>
                            setStorage(parseInt(e.target.value) || 0)
                        }
                        onBlur={() => validateField?.('storage', storage)}
                        placeholder="5120"
                        min="1"
                        required
                    />
                    {errors.storage && (
                        <p className="text-primary-400 mt-1 text-xs">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.storage}
                        </p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="ports" required>
                        Ports
                    </InputLabel>
                    <Input
                        id="ports"
                        type="number"
                        step="1"
                        value={ports}
                        onChange={(e) =>
                            setPorts(parseInt(e.target.value) || 0)
                        }
                        onBlur={() => validateField?.('ports', ports)}
                        placeholder="1"
                        min="0"
                        required
                    />
                    {errors.ports && (
                        <p className="text-primary-400 mt-1 text-xs">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.ports}
                        </p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="databases" required>
                        Databases
                    </InputLabel>
                    <Input
                        id="databases"
                        type="number"
                        step="1"
                        value={databases}
                        onChange={(e) =>
                            setDatabases(parseInt(e.target.value) || 0)
                        }
                        onBlur={() => validateField?.('databases', databases)}
                        placeholder="0"
                        min="0"
                        required
                    />
                    {errors.databases && (
                        <p className="text-primary-400 mt-1 text-xs">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.databases}
                        </p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="backups" required>
                        Backups
                    </InputLabel>
                    <Input
                        id="backups"
                        type="number"
                        step="1"
                        value={backups}
                        onChange={(e) =>
                            setBackups(parseInt(e.target.value) || 0)
                        }
                        onBlur={() => validateField?.('backups', backups)}
                        placeholder="0"
                        min="0"
                        required
                    />
                    {errors.backups && (
                        <p className="text-primary-400 mt-1 text-xs">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.backups}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
