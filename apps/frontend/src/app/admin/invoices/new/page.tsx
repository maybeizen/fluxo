'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createInvoice } from '@/lib/admin/invoices'
import { InvoiceStatus, PaymentProvider, InvoiceItem, User } from '@fluxo/types'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import UserSearchSelect from '@/components/ui/input/user-search-select'
import ProductSelect from '@/components/ui/input/product-select'
import Checkbox from '@/components/ui/input/checkbox'
import Button from '@/components/ui/button'
import { useNotifications } from '@/context/notification-context'
import useFormValidation from '@/hooks/use-form-validation'
import {
    createInvoiceSchema,
    type CreateInvoiceFormData,
} from '@/validators/invoice/create-invoice'
import InvoiceItemForm from '@/components/admin/invoices/invoice-item-form'

export default function NewInvoicePage() {
    const router = useRouter()
    const notifications = useNotifications()
    const { errors, validateAllFields, validateField } =
        useFormValidation<CreateInvoiceFormData>(createInvoiceSchema)

    const [isSaving, setIsSaving] = useState(false)

    const [userId, setUserId] = useState('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [items, setItems] = useState<InvoiceItem[]>([
        { name: '', quantity: 1, unitPrice: 0, total: 0 },
    ])
    const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.PENDING)
    const [amount, setAmount] = useState(0)
    const [expiresAt, setExpiresAt] = useState(() => {
        const date = new Date()
        date.setDate(date.getDate() + 3)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    })
    const [isOneTime, setIsOneTime] = useState(false)
    const [planId, setPlanId] = useState('')
    const [serviceName, setServiceName] = useState('')
    const [location, setLocation] = useState('')
    const [dedicatedIP, setDedicatedIP] = useState(false)
    const [proxySetup, setProxySetup] = useState(false)
    const [type, setType] = useState('')
    const [version, setVersion] = useState('')
    const prevDedicatedIPRef = useRef(dedicatedIP)
    const prevProxySetupRef = useRef(proxySetup)

    const handleUserSelect = (userUuid: string, user: User) => {
        setUserId(userUuid)
        setSelectedUser(user)
    }

    const handleClearUser = () => {
        setUserId('')
        setSelectedUser(null)
    }

    const handleItemChange = (index: number, item: InvoiceItem) => {
        const updatedItems = [...items]
        updatedItems[index] = item
        setItems(updatedItems)

        const total = updatedItems.reduce((sum, i) => sum + i.total, 0)
        setAmount(total)
    }

    const handleAddItem = () => {
        setItems([...items, { name: '', quantity: 1, unitPrice: 0, total: 0 }])
    }

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            const updatedItems = items.filter((_, i) => i !== index)
            setItems(updatedItems)
            const total = updatedItems.reduce((sum, i) => sum + i.total, 0)
            setAmount(total)
        }
    }

    useEffect(() => {
        if (
            prevDedicatedIPRef.current === dedicatedIP &&
            prevProxySetupRef.current === proxySetup
        ) {
            return
        }

        prevDedicatedIPRef.current = dedicatedIP
        prevProxySetupRef.current = proxySetup

        setItems((currentItems) => {
            const dedicatedIPItemIndex = currentItems.findIndex(
                (item) => item.name === 'Dedicated IP'
            )
            const proxySetupItemIndex = currentItems.findIndex(
                (item) => item.name === 'Proxy Setup (one-time)'
            )

            let updatedItems = [...currentItems]
            let hasChanges = false

            if (dedicatedIP && dedicatedIPItemIndex === -1) {
                updatedItems.push({
                    name: 'Dedicated IP',
                    quantity: 1,
                    unitPrice: 2.99,
                    total: 2.99,
                })
                hasChanges = true
            } else if (!dedicatedIP && dedicatedIPItemIndex !== -1) {
                updatedItems = updatedItems.filter(
                    (_, i) => i !== dedicatedIPItemIndex
                )
                hasChanges = true
            }

            if (proxySetup && proxySetupItemIndex === -1) {
                updatedItems.push({
                    name: 'Proxy Setup (one-time)',
                    quantity: 1,
                    unitPrice: 10.0,
                    total: 10.0,
                })
                hasChanges = true
            } else if (!proxySetup && proxySetupItemIndex !== -1) {
                updatedItems = updatedItems.filter(
                    (_, i) => i !== proxySetupItemIndex
                )
                hasChanges = true
            }

            if (hasChanges) {
                const total = updatedItems.reduce((sum, i) => sum + i.total, 0)
                setAmount(total)
                return updatedItems
            }

            return currentItems
        })
    }, [dedicatedIP, proxySetup])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const expiresAtDate = new Date(expiresAt)
        expiresAtDate.setHours(23, 59, 59, 999)
        const expiresAtISO = expiresAtDate.toISOString().slice(0, 16)

        const formData: CreateInvoiceFormData = {
            userId,
            items,
            status,
            amount,
            currency: 'usd',
            expiresAt: expiresAtISO,
            metadata: {
                planId,
                serviceName,
                location,
                dedicatedIP,
                proxySetup,
                type,
                version,
                isOneTime,
            },
        }

        const validation = validateAllFields(formData)
        if (!validation.isValid) {
            const errorMessages = Object.entries(validation.errors)
                .map(([field, message]) => `${field}: ${message}`)
                .join('; ')
            notifications.error(
                errorMessages ||
                    'Please fix the validation errors before submitting'
            )
            return
        }

        setIsSaving(true)

        try {
            const expiresAtDate = new Date(expiresAt)
            expiresAtDate.setHours(23, 59, 59, 999)

            const metadata = {
                planId,
                serviceName,
                location,
                dedicatedIP,
                proxySetup,
                type,
                version,
                isOneTime,
            }

            const invoiceData = {
                userId,
                items: items.map((item) => ({
                    ...item,
                    unitPrice: item.unitPrice,
                    total: item.total,
                })),
                status,
                amount,
                currency: 'usd',
                expiresAt: expiresAtDate,
                metadata,
            }

            const result = await createInvoice(invoiceData)

            if (result.success) {
                notifications.success('Invoice created successfully')
                router.push('/admin/invoices')
            } else {
                notifications.error(
                    result.message || 'Failed to create invoice'
                )
            }
        } catch (error: unknown) {
            if (
                error &&
                typeof error === 'object' &&
                'response' in error &&
                (
                    error.response as {
                        data?: {
                            errors?: Array<{
                                field?: string
                                message?: string
                            }>
                        }
                    }
                )?.data?.errors
            ) {
                const errorMessages = (
                    error.response as {
                        data: {
                            errors: Array<{ field?: string; message?: string }>
                        }
                    }
                ).data.errors
                    .map((err) => `${err.field}: ${err.message}`)
                    .join(', ')
                notifications.error(errorMessages)
            } else {
                notifications.error('Failed to create invoice')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        router.push('/admin/invoices')
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Create Invoice
                        </h1>
                        <p className="text-zinc-400">
                            Create a new invoice for a user
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        icon="fas fa-arrow-left"
                    >
                        Back to Invoices
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Invoice Information
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="userId" required>
                                    User
                                </InputLabel>
                                <UserSearchSelect
                                    value={userId}
                                    onSelect={handleUserSelect}
                                    placeholder="Search for user..."
                                />
                                {selectedUser && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-xs text-zinc-500">
                                            Selected:{' '}
                                            {selectedUser.profile?.username ||
                                                selectedUser.email}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearUser}
                                            className="px-2"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                )}
                                {errors.userId && (
                                    <p className="text-primary-400 mt-1 text-sm">
                                        {errors.userId}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="status">Status</InputLabel>
                                <SelectMenu
                                    id="status"
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(
                                            e.target.value as InvoiceStatus
                                        )
                                    }
                                    options={[
                                        {
                                            value: InvoiceStatus.PENDING,
                                            label: 'Pending',
                                        },
                                        {
                                            value: InvoiceStatus.PAID,
                                            label: 'Paid',
                                        },
                                        {
                                            value: InvoiceStatus.EXPIRED,
                                            label: 'Expired',
                                        },
                                    ]}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="expiresAt" required>
                                    Expiration Date
                                </InputLabel>
                                <Input
                                    id="expiresAt"
                                    type="date"
                                    value={expiresAt}
                                    onChange={(e) =>
                                        setExpiresAt(e.target.value)
                                    }
                                    required
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    Date when the invoice expires
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <Checkbox
                                    id="isOneTime"
                                    checked={isOneTime}
                                    onChange={(e) =>
                                        setIsOneTime(e.target.checked)
                                    }
                                    label="One-time invoice (will not create a service)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <div className="mb-6 flex items-center justify-between border-b border-zinc-900 pb-4">
                            <h2 className="text-xl font-semibold text-white">
                                Invoice Items
                            </h2>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleAddItem}
                            >
                                <i className="fas fa-plus mr-2"></i>
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <InvoiceItemForm
                                    key={index}
                                    item={item}
                                    index={index}
                                    onChange={handleItemChange}
                                    onRemove={handleRemoveItem}
                                    error={errors.items}
                                />
                            ))}
                        </div>

                        {errors.items && (
                            <p className="text-primary-400 mt-2 text-sm">
                                {errors.items}
                            </p>
                        )}
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Service Metadata
                        </h2>
                        <p className="mb-6 text-sm text-zinc-400">
                            Required: Fill this section to enable automatic
                            service creation when this invoice is paid.
                        </p>
                        {errors.metadata && (
                            <div className="border-primary-400/20 bg-primary-400/10 mb-4 rounded-md border p-3">
                                <p className="text-primary-400 text-sm">
                                    {errors.metadata}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="planId" required>
                                    Product
                                </InputLabel>
                                <ProductSelect
                                    value={planId}
                                    onChange={setPlanId}
                                    includeHidden={true}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="serviceName" required>
                                    Service Name
                                </InputLabel>
                                <Input
                                    id="serviceName"
                                    type="text"
                                    value={serviceName}
                                    onChange={(e) =>
                                        setServiceName(e.target.value)
                                    }
                                    placeholder="e.g., My Minecraft Server"
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="location" required>
                                    Location
                                </InputLabel>
                                <SelectMenu
                                    id="location"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(e.target.value)
                                    }
                                    required
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select location...',
                                            disabled: true,
                                        },
                                        {
                                            value: 'new-york',
                                            label: 'New York, USA',
                                        },
                                        {
                                            value: 'miami',
                                            label: 'Florida, USA',
                                        },
                                        {
                                            value: 'germany',
                                            label: 'Germany, DE',
                                        },
                                        {
                                            value: 'singapore',
                                            label: 'Singapore, SG',
                                        },
                                    ]}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="type" required>
                                    Type
                                </InputLabel>
                                <SelectMenu
                                    id="type"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    required
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select type...',
                                            disabled: true,
                                        },
                                        {
                                            value: 'java',
                                            label: 'Minecraft: Java Edition',
                                        },
                                        {
                                            value: 'bedrock',
                                            label: 'Minecraft: Bedrock Edition',
                                        },
                                    ]}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="version" required>
                                    Version
                                </InputLabel>
                                <Input
                                    id="version"
                                    type="text"
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    placeholder="e.g., 1.20.1"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <Checkbox
                                    id="dedicatedIP"
                                    label="Dedicated IP"
                                    checked={dedicatedIP}
                                    onChange={(e) =>
                                        setDedicatedIP(e.target.checked)
                                    }
                                />

                                <Checkbox
                                    id="proxySetup"
                                    label="Proxy Setup"
                                    checked={proxySetup}
                                    onChange={(e) =>
                                        setProxySetup(e.target.checked)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Summary
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Subtotal:</span>
                                <span className="font-medium text-white">
                                    ${amount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                                <span className="text-lg font-semibold text-white">
                                    Total Amount:
                                </span>
                                <span className="text-xl font-bold text-white">
                                    ${amount.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {errors.amount && (
                            <p className="text-primary-400 mt-2 text-sm">
                                {errors.amount}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isSaving}
                        >
                            Create Invoice
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
