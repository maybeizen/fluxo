'use client'

import React, { useState, useEffect } from 'react'
import { Coupon, CouponType, CouponDurationType } from '@fluxo/types'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'
import { fetchCouponStats, type CouponStats } from '@/lib/admin/coupons'

interface CouponTableProps {
    coupons: Coupon[]
    isLoading?: boolean
    onEdit?: (couponId: string) => void
    onDelete?: (couponId: string) => void
    onViewStats?: (couponId: string) => void
    className?: string
}

export default function CouponTable({
    coupons,
    isLoading = false,
    onEdit,
    onDelete,
    onViewStats,
    className = '',
}: CouponTableProps) {
    const notifications = useNotifications()
    const [statsCache, setStatsCache] = useState<Record<string, CouponStats>>(
        {}
    )

    useEffect(() => {
        const loadStats = async () => {
            for (const coupon of coupons) {
                if (!statsCache[coupon.uuid]) {
                    const stats = await fetchCouponStats(coupon.uuid)
                    if (stats) {
                        setStatsCache((prev) => ({
                            ...prev,
                            [coupon.uuid]: stats,
                        }))
                    }
                }
            }
        }

        if (coupons.length > 0) {
            loadStats()
        }
    }, [coupons])

    const handleCopyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code)
            notifications.success('Coupon code copied to clipboard')
        } catch (error) {
            console.error('Failed to copy code:', error)
            notifications.error('Failed to copy code')
        }
    }

    const handleCopyId = async (couponId: string) => {
        try {
            await navigator.clipboard.writeText(couponId)
            notifications.success('Coupon ID copied to clipboard')
        } catch (error) {
            console.error('Failed to copy ID:', error)
            notifications.error('Failed to copy ID')
        }
    }

    const getTypeBadge = (type: CouponType) => {
        const colors = {
            [CouponType.PERCENTAGE]:
                'bg-blue-500/10 text-blue-500 border-blue-500/20',
            [CouponType.FIXED]:
                'bg-green-500/10 text-green-500 border-green-500/20',
        }

        return (
            <span
                className={`rounded border px-2 py-1 text-xs font-medium ${colors[type]}`}
            >
                {type === CouponType.PERCENTAGE ? 'Percentage' : 'Fixed'}
            </span>
        )
    }

    const getStatusBadge = (coupon: Coupon) => {
        const stats = statsCache[coupon.uuid]

        if (coupon.timestamps.deletedAt) {
            return (
                <span className="rounded border border-zinc-500/20 bg-zinc-500/10 px-2 py-1 text-xs font-medium text-zinc-400">
                    Deleted
                </span>
            )
        }

        if (!stats) {
            return (
                <span className="rounded border border-zinc-500/20 bg-zinc-500/10 px-2 py-1 text-xs font-medium text-zinc-400">
                    Loading...
                </span>
            )
        }

        if (stats.isActive) {
            return (
                <span className="rounded border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                    Active
                </span>
            )
        }

        if (stats.isExpired) {
            return (
                <span className="border-primary-400/20 bg-primary-400/10 text-primary-400 rounded border px-2 py-1 text-xs font-medium">
                    Expired
                </span>
            )
        }

        if (stats.isMaxedOut) {
            return (
                <span className="rounded border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
                    Max Reached
                </span>
            )
        }

        return (
            <span className="rounded border border-zinc-500/20 bg-zinc-500/10 px-2 py-1 text-xs font-medium text-zinc-400">
                Inactive
            </span>
        )
    }

    const formatValue = (type: CouponType, value: number) => {
        if (type === CouponType.PERCENTAGE) {
            return `${value}%`
        }
        return `$${value.toFixed(2)}`
    }

    const formatDuration = (duration: Coupon['duration']) => {
        switch (duration.type) {
            case CouponDurationType.ONCE:
                return 'Once'
            case CouponDurationType.REPEATING:
                return `${duration.count || 0}x`
            case CouponDurationType.FOREVER:
                return 'Forever'
            default:
                return 'Unknown'
        }
    }

    const formatDate = (date?: Date | string | null) => {
        if (!date) return 'Never'
        const d = new Date(date)
        d.setDate(d.getDate() + 1)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
            </div>
        )
    }

    if (coupons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                    <i className="fas fa-ticket text-2xl text-zinc-600"></i>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                    No Coupons Found
                </h3>
                <p className="max-w-md text-sm text-zinc-400">
                    No coupons match your current filters. Try adjusting your
                    search criteria.
                </p>
            </div>
        )
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-zinc-800">
                        <th className="w-24 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Code
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Value
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Duration
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Usage
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Expires
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Status
                        </th>
                        <th className="w-40 px-4 py-3 text-right text-sm font-medium text-zinc-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {coupons.map((coupon, index) => {
                        const stats = statsCache[coupon.uuid]

                        return (
                            <tr
                                key={coupon.uuid || `coupon-${index}`}
                                className="border-b border-zinc-900 transition-colors hover:bg-zinc-900/50"
                            >
                                <td className="px-4 py-3">
                                    <div
                                        className="group flex w-fit cursor-pointer items-center gap-2 transition-colors hover:text-white"
                                        onClick={() =>
                                            handleCopyId(coupon.uuid)
                                        }
                                        title="Click to copy ID"
                                    >
                                        <span className="font-mono text-xs text-zinc-400 group-hover:text-white">
                                            {coupon.uuid}
                                        </span>
                                        <i className="fas fa-copy flex-shrink-0 text-xs text-zinc-600 group-hover:text-zinc-400"></i>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div
                                        className="group flex w-fit cursor-pointer items-center gap-2 transition-colors hover:text-white"
                                        onClick={() =>
                                            handleCopyCode(coupon.code)
                                        }
                                        title="Click to copy code"
                                    >
                                        <span className="group-hover:text-primary-400 font-mono text-sm font-medium text-white">
                                            {coupon.code}
                                        </span>
                                        <i className="fas fa-copy flex-shrink-0 text-xs text-zinc-600 group-hover:text-zinc-400"></i>
                                    </div>
                                    {coupon.userUuid && (
                                        <span className="mt-1 block text-xs text-zinc-500">
                                            User-specific
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {getTypeBadge(coupon.type)}
                                </td>
                                <td className="px-4 py-3 font-mono text-sm text-zinc-400">
                                    {formatValue(coupon.type, coupon.value)}
                                </td>
                                <td className="px-4 py-3 text-sm text-zinc-400">
                                    {formatDuration(coupon.duration)}
                                </td>
                                <td className="px-4 py-3 text-sm text-zinc-400">
                                    {stats ? (
                                        <>
                                            {stats.redemptionCount}
                                            {coupon.maxRedemptions &&
                                                ` / ${coupon.maxRedemptions}`}
                                        </>
                                    ) : (
                                        '...'
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-zinc-400">
                                    {formatDate(coupon.expiresAt)}
                                </td>
                                <td className="px-4 py-3">
                                    {getStatusBadge(coupon)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        {onViewStats && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    onViewStats(coupon.uuid)
                                                }
                                                className="px-3"
                                                title="View Stats"
                                            >
                                                <i className="fas fa-chart-bar"></i>
                                            </Button>
                                        )}
                                        {onEdit && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    onEdit(coupon.uuid)
                                                }
                                                className="px-3"
                                                title="Edit"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button
                                                variant="fail"
                                                size="sm"
                                                onClick={() =>
                                                    onDelete(coupon.uuid)
                                                }
                                                className="px-3"
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
