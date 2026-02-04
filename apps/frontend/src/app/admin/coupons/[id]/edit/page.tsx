'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Coupon, CouponType, CouponDurationType, User } from '@fluxo/types'
import { fetchCouponById, updateCoupon } from '@/lib/admin/coupons'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import DatePicker from '@/components/ui/input/date-picker'
import UserSearchSelect from '@/components/ui/input/user-search-select'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'
import useFormValidation from '@/hooks/use-form-validation'
import {
    editCouponSchema,
    type EditCouponFormData,
} from '@/validators/coupon/edit-coupon'

export default function EditCouponPage() {
    const router = useRouter()
    const params = useParams()
    const notifications = useNotifications()
    const { errors, validateAllFields, validateField } =
        useFormValidation<EditCouponFormData>(editCouponSchema)
    const couponId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [coupon, setCoupon] = useState<Coupon | null>(null)

    const [code, setCode] = useState('')
    const [type, setType] = useState<CouponType>(CouponType.PERCENTAGE)
    const [value, setValue] = useState<number>(0)
    const [durationType, setDurationType] = useState<CouponDurationType>(
        CouponDurationType.ONCE
    )
    const [durationCount, setDurationCount] = useState<number>(1)
    const [maxRedemptions, setMaxRedemptions] = useState<number | undefined>(
        undefined
    )
    const [expiresAt, setExpiresAt] = useState<string>('')
    const [userUuid, setUserUuid] = useState<string | null>(null)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const handleUserSelect = (userId: string, user: User) => {
        setUserUuid(userId)
        setSelectedUser(user)
    }

    const handleClearUser = () => {
        setUserUuid(null)
        setSelectedUser(null)
    }

    const extractDateString = (
        date: Date | string | null | undefined
    ): string => {
        if (!date) return ''

        if (typeof date === 'string') {
            return date.split('T')[0]
        }

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    useEffect(() => {
        const loadCoupon = async () => {
            try {
                const data = await fetchCouponById(couponId)
                if (!data) {
                    notifications.error('Coupon not found')
                    router.push('/admin/coupons')
                    return
                }

                setCoupon(data)
                setCode(data.code)
                setType(data.type)
                setValue(data.value)
                setDurationType(data.duration.type)
                setDurationCount(data.duration.count || 1)
                setMaxRedemptions(data.maxRedemptions)
                setExpiresAt(extractDateString(data.expiresAt))
                setUserUuid(data.userUuid)
            } catch (error) {
                console.error('Error loading coupon:', error)
                notifications.error('Failed to load coupon')
                router.push('/admin/coupons')
            } finally {
                setIsLoading(false)
            }
        }

        loadCoupon()
    }, [couponId])

    const hasChanges = () => {
        if (!coupon) return false

        const expiresAtOriginal = extractDateString(coupon.expiresAt)

        return (
            code !== coupon.code ||
            type !== coupon.type ||
            value !== coupon.value ||
            durationType !== coupon.duration.type ||
            (durationType === CouponDurationType.REPEATING &&
                durationCount !== coupon.duration.count) ||
            maxRedemptions !== coupon.maxRedemptions ||
            expiresAt !== expiresAtOriginal ||
            userUuid !== coupon.userUuid
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!hasChanges()) {
            notifications.info('No changes to save')
            router.push('/admin/coupons')
            return
        }

        const formData: EditCouponFormData = {
            code,
            type,
            value,
            durationType,
            durationCount:
                durationType === CouponDurationType.REPEATING
                    ? durationCount
                    : undefined,
            maxRedemptions:
                maxRedemptions && maxRedemptions > 0 ? maxRedemptions : null,
            expiresAt: expiresAt || null,
            userUuid: userUuid || null,
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
            const updates: Record<string, unknown> = {}

            if (code !== coupon?.code) updates.code = code.toUpperCase()
            if (type !== coupon?.type) updates.type = type
            if (value !== coupon?.value) updates.value = value
            if (
                durationType !== coupon?.duration.type ||
                (durationType === CouponDurationType.REPEATING &&
                    durationCount !== coupon?.duration.count)
            ) {
                updates.duration = {
                    type: durationType,
                    count:
                        durationType === CouponDurationType.REPEATING
                            ? durationCount
                            : undefined,
                }
            }
            const currentMaxRedemptions =
                maxRedemptions && maxRedemptions > 0 ? maxRedemptions : null
            const originalMaxRedemptions =
                coupon?.maxRedemptions && coupon.maxRedemptions > 0
                    ? coupon.maxRedemptions
                    : null

            if (currentMaxRedemptions !== originalMaxRedemptions) {
                updates.maxRedemptions = currentMaxRedemptions
            }

            const expiresAtOriginal = extractDateString(coupon?.expiresAt)
            if (expiresAt !== expiresAtOriginal) {
                updates.expiresAt = expiresAt ? new Date(expiresAt) : null
            }

            if (userUuid !== coupon?.userUuid) {
                updates.userUuid = userUuid
            }

            await updateCoupon(couponId, updates)
            notifications.success('Coupon updated successfully')
            router.push('/admin/coupons')
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
                notifications.error('Failed to update coupon')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        router.push('/admin/coupons')
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

    if (!coupon) {
        return null
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Edit Coupon
                        </h1>
                        <p className="text-zinc-400">
                            Update coupon details and settings
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        icon="fas fa-arrow-left"
                    >
                        Back to Coupons
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Coupon Information
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="code" required>
                                    Coupon Code
                                </InputLabel>
                                <Input
                                    id="code"
                                    type="text"
                                    value={code}
                                    onChange={(e) =>
                                        setCode(e.target.value.toUpperCase())
                                    }
                                    onBlur={() => validateField('code', code)}
                                    placeholder="SUMMER2025"
                                    pattern="[A-Z0-9_\-]+"
                                    title="Only uppercase letters, numbers, hyphens, and underscores"
                                    required
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    3-50 characters. Only uppercase letters,
                                    numbers, hyphens, and underscores.
                                </p>
                                {errors.code && (
                                    <p className="text-primary-400 mt-1 text-xs">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="type" required>
                                    Discount Type
                                </InputLabel>
                                <SelectMenu
                                    id="type"
                                    value={type}
                                    onChange={(e) =>
                                        setType(e.target.value as CouponType)
                                    }
                                    options={[
                                        {
                                            value: CouponType.PERCENTAGE,
                                            label: 'Percentage',
                                        },
                                        {
                                            value: CouponType.FIXED,
                                            label: 'Fixed Amount',
                                        },
                                    ]}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="value" required>
                                    {type === CouponType.PERCENTAGE
                                        ? 'Percentage (%)'
                                        : 'Amount ($)'}
                                </InputLabel>
                                <Input
                                    id="value"
                                    type="number"
                                    step={
                                        type === CouponType.PERCENTAGE
                                            ? '1'
                                            : '0.01'
                                    }
                                    value={value}
                                    onChange={(e) =>
                                        setValue(
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    onBlur={() => validateField('value', value)}
                                    placeholder={
                                        type === CouponType.PERCENTAGE
                                            ? '10'
                                            : '5.00'
                                    }
                                    min="0"
                                    max={
                                        type === CouponType.PERCENTAGE
                                            ? '100'
                                            : undefined
                                    }
                                    required
                                />
                                {type === CouponType.PERCENTAGE && (
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Must be between 0 and 100
                                    </p>
                                )}
                                {errors.value && (
                                    <p className="text-primary-400 mt-1 text-xs">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.value}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="durationType" required>
                                    Duration Type
                                </InputLabel>
                                <SelectMenu
                                    id="durationType"
                                    value={durationType}
                                    onChange={(e) =>
                                        setDurationType(
                                            e.target.value as CouponDurationType
                                        )
                                    }
                                    options={[
                                        {
                                            value: CouponDurationType.ONCE,
                                            label: 'Once',
                                        },
                                        {
                                            value: CouponDurationType.REPEATING,
                                            label: 'Repeating',
                                        },
                                        {
                                            value: CouponDurationType.FOREVER,
                                            label: 'Forever',
                                        },
                                    ]}
                                />
                            </div>

                            {durationType === CouponDurationType.REPEATING && (
                                <div>
                                    <InputLabel
                                        htmlFor="durationCount"
                                        required
                                    >
                                        Number of Billing Cycles
                                    </InputLabel>
                                    <Input
                                        id="durationCount"
                                        type="number"
                                        step="1"
                                        value={durationCount}
                                        onChange={(e) =>
                                            setDurationCount(
                                                parseInt(e.target.value) || 1
                                            )
                                        }
                                        onBlur={() =>
                                            validateField(
                                                'durationCount',
                                                durationCount
                                            )
                                        }
                                        placeholder="3"
                                        min="1"
                                        required
                                    />
                                    {errors.durationCount && (
                                        <p className="text-primary-400 mt-1 text-xs">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.durationCount}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="maxRedemptions">
                                    Max Redemptions
                                </InputLabel>
                                <Input
                                    id="maxRedemptions"
                                    type="number"
                                    step="1"
                                    value={maxRedemptions || ''}
                                    onChange={(e) => {
                                        const value = e.target.value.trim()
                                        if (!value || value === '') {
                                            setMaxRedemptions(undefined)
                                        } else {
                                            const numValue = parseInt(value, 10)
                                            setMaxRedemptions(
                                                !isNaN(numValue) && numValue > 0
                                                    ? numValue
                                                    : undefined
                                            )
                                        }
                                    }}
                                    placeholder="Unlimited"
                                    min="1"
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    Leave empty for unlimited
                                </p>
                            </div>

                            <div>
                                <InputLabel htmlFor="expiresAt">
                                    Expiration Date
                                </InputLabel>
                                <DatePicker
                                    id="expiresAt"
                                    value={expiresAt}
                                    onChange={(e) =>
                                        setExpiresAt(e.target.value)
                                    }
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    Leave empty for no expiration
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            User Restriction (Optional)
                        </h2>

                        <div>
                            <InputLabel htmlFor="userUuid">
                                Restrict to Specific User
                            </InputLabel>
                            {selectedUser ? (
                                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                                    <div>
                                        <p className="font-medium text-white">
                                            {selectedUser.profile?.username}
                                        </p>
                                        <p className="text-sm text-zinc-400">
                                            {selectedUser.email}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearUser}
                                        icon="fas fa-times"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            ) : userUuid ? (
                                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                                    <div>
                                        <p className="font-mono text-sm font-medium text-white">
                                            {userUuid}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            User ID
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearUser}
                                        icon="fas fa-times"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            ) : (
                                <UserSearchSelect
                                    value={userUuid || ''}
                                    onSelect={handleUserSelect}
                                    placeholder="Search by username or email..."
                                />
                            )}
                            <p className="mt-2 text-xs text-zinc-500">
                                If specified, only this user can use the coupon.
                                Leave empty for public coupon.
                            </p>
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
                            disabled={!hasChanges()}
                        >
                            Update Coupon
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
