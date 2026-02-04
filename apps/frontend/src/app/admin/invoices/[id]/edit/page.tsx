'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Invoice, InvoiceStatus, InvoiceItem, User } from '@fluxo/types'
import { fetchInvoiceById, updateInvoice } from '@/lib/admin/invoices'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import UserSearchSelect from '@/components/ui/input/user-search-select'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'
import useFormValidation from '@/hooks/use-form-validation'
import {
    editInvoiceSchema,
    type EditInvoiceFormData,
} from '@/validators/invoice/edit-invoice'
import InvoiceItemForm from '@/components/admin/invoices/invoice-item-form'

export default function EditInvoicePage() {
    const router = useRouter()
    const params = useParams()
    const notifications = useNotifications()
    useFormValidation<EditInvoiceFormData>(editInvoiceSchema)
    const invoiceId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [invoice, setInvoice] = useState<Invoice | null>(null)

    const [userId, setUserId] = useState('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [items, setItems] = useState<InvoiceItem[]>([])
    const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.PENDING)
    const [amount, setAmount] = useState(0)
    const [dueDate, setDueDate] = useState('')

    const handleUserSelect = (userUuid: string, user: User) => {
        setUserId(userUuid)
        setSelectedUser(user)
    }

    const handleClearUser = () => {
        setUserId('')
        setSelectedUser(null)
    }

    const formatDateLocal = (date?: Date | string | null): string => {
        if (!date) return ''
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    useEffect(() => {
        const loadInvoice = async () => {
            try {
                const data = await fetchInvoiceById(invoiceId)
                if (!data) {
                    notifications.error('Invoice not found')
                    router.push('/admin/invoices')
                    return
                }

                setInvoice(data)
                setUserId(data.userId)
                setItems(
                    data.items.map((item) => ({
                        ...item,
                        unitPrice: item.unitPrice / 100,
                        total: item.total / 100,
                    }))
                )
                setStatus(data.status)
                setAmount(data.amount / 100)
                const expiresAtDate = new Date(data.timestamps.expiresAt)
                expiresAtDate.setDate(expiresAtDate.getDate() - 7)
                setDueDate(formatDateLocal(expiresAtDate))
            } catch (error) {
                console.error('Error loading invoice:', error)
                notifications.error('Failed to load invoice')
                router.push('/admin/invoices')
            } finally {
                setIsLoading(false)
            }
        }

        loadInvoice()
    }, [invoiceId])

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

    const hasChanges = () => {
        if (!invoice) return false

        const currentDueDate = (() => {
            const expiresAtDate = new Date(invoice.timestamps.expiresAt)
            expiresAtDate.setDate(expiresAtDate.getDate() - 7)
            return formatDateLocal(expiresAtDate)
        })()

        return (
            userId !== invoice.userId ||
            JSON.stringify(
                items.map((i) => ({
                    ...i,
                    unitPrice: i.unitPrice * 100,
                    total: i.total * 100,
                }))
            ) !== JSON.stringify(invoice.items) ||
            status !== invoice.status ||
            Math.abs(amount - invoice.amount / 100) > 0.01 ||
            dueDate !== currentDueDate
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!hasChanges()) {
            notifications.info('No changes to save')
            router.push('/admin/invoices')
            return
        }

        setIsSaving(true)

        try {
            const updates: Record<string, unknown> = {}

            if (userId !== invoice?.userId) updates.userId = userId

            const itemsChanged =
                JSON.stringify(
                    items.map((i) => ({
                        ...i,
                        unitPrice: i.unitPrice * 100,
                        total: i.total * 100,
                    }))
                ) !== JSON.stringify(invoice?.items || [])
            if (itemsChanged) {
                updates.items = items.map((item) => ({
                    ...item,
                    unitPrice: item.unitPrice,
                    total: item.total,
                }))
            }

            if (status !== invoice?.status) updates.status = status
            if (Math.abs(amount - (invoice?.amount || 0) / 100) > 0.01)
                updates.amount = amount

            const currentDueDate = (() => {
                if (!invoice) return ''
                const expiresAtDate = new Date(invoice.timestamps.expiresAt)
                expiresAtDate.setDate(expiresAtDate.getDate() - 7)
                return formatDateLocal(expiresAtDate)
            })()

            if (dueDate !== currentDueDate && dueDate) {
                const dueDateObj = new Date(dueDate)
                const expiresAtDate = new Date(dueDateObj)
                expiresAtDate.setDate(expiresAtDate.getDate() + 7)
                updates.expiresAt = expiresAtDate
            }

            await updateInvoice(invoiceId, updates)
            notifications.success('Invoice updated successfully')
            router.push('/admin/invoices')
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
                notifications.error('Failed to update invoice')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        router.push('/admin/invoices')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
                <div className="mx-auto flex max-w-4xl items-center justify-center py-20">
                    <Spinner size="xl" />
                </div>
            </div>
        )
    }

    if (!invoice) {
        return null
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Edit Invoice
                        </h1>
                        <p className="text-zinc-400">
                            Update invoice details and settings
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
                                <InputLabel htmlFor="dueDate" required>
                                    Due Date
                                </InputLabel>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    Invoice will expire 7 days after the due
                                    date
                                </p>
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
                                />
                            ))}
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
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
