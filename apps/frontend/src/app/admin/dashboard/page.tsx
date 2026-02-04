'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { fetchUsers } from '@/lib/admin/users'
import { fetchServices } from '@/lib/admin/services'
import { fetchInvoices } from '@/lib/admin/invoices'
import { ServiceStatus, InvoiceStatus, UserRole } from '@fluxo/types'
import { calculateAmountWithCoupon } from '@/utils/invoice-calculations'
import UserMetricsCard from '@/components/admin/dashboard/user-metrics-card'
import FinancialSnapshotCard from '@/components/admin/dashboard/financial-snapshot-card'
import ServiceOverviewCard from '@/components/admin/dashboard/service-overview-card'
import BusinessPerformanceCard from '@/components/admin/dashboard/business-performance-card'

export default function AdminDashboardPage() {
    const { user } = useAuth()
    const [totalUsers, setTotalUsers] = useState(0)
    const [verifiedUsers, setVerifiedUsers] = useState(0)
    const [adminUsers, setAdminUsers] = useState(0)
    const [isLoadingUsers, setIsLoadingUsers] = useState(true)

    const [isLoadingFinancial, setIsLoadingFinancial] = useState(true)
    const [financialData, setFinancialData] = useState({
        totalRevenue: 0,
        monthToDate: 0,
        lastFourWeeks: 0,
        pendingInvoices: 0,
    })

    const [isLoadingServices, setIsLoadingServices] = useState(true)
    const [serviceData, setServiceData] = useState({
        totalServices: 0,
        activeServices: 0,
        suspendedServices: 0,
        cancelledServices: 0,
    })

    const [isLoadingPerformance, setIsLoadingPerformance] = useState(true)
    const [performanceData, setPerformanceData] = useState({
        totalPaidInvoices: 0,
        averageCost: 0,
        renewalRate: 0,
    })

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoadingUsers(true)
            const [allUsers, verified, admins] = await Promise.all([
                fetchUsers(),
                fetchUsers({ verified: 'true' }),
                fetchUsers({ role: 'admin' }),
            ])
            setTotalUsers(allUsers.total)
            setVerifiedUsers(verified.total)
            setAdminUsers(admins.total)
            setIsLoadingUsers(false)
        }
        loadUsers()
    }, [])

    useEffect(() => {
        if (user?.role !== UserRole.ADMIN) {
            setTimeout(() => {
                setIsLoadingFinancial(false)
            }, 0)
            return
        }

        const loadFinancialData = async () => {
            setIsLoadingFinancial(true)
            try {
                const now = new Date()
                const startOfMonth = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                )
                const fourWeeksAgo = new Date(
                    now.getTime() - 28 * 24 * 60 * 60 * 1000
                )

                const [allInvoices, pendingInvoicesResponse] =
                    await Promise.all([
                        fetchInvoices({ limit: 1000 }),
                        fetchInvoices({
                            status: InvoiceStatus.PENDING,
                            limit: 1000,
                        }),
                    ])

                const paidInvoices = allInvoices.invoices.filter(
                    (inv) =>
                        inv.status === InvoiceStatus.PAID &&
                        inv.timestamps.paidAt
                )

                const totalRevenue = paidInvoices.reduce(
                    (sum, inv) =>
                        sum + calculateAmountWithCoupon(inv.amount, inv.coupon),
                    0
                )

                const monthToDate = paidInvoices
                    .filter((inv) => {
                        const paidAt = new Date(inv.timestamps.paidAt!)
                        return paidAt >= startOfMonth
                    })
                    .reduce(
                        (sum, inv) =>
                            sum +
                            calculateAmountWithCoupon(inv.amount, inv.coupon),
                        0
                    )

                const lastFourWeeks = paidInvoices
                    .filter((inv) => {
                        const paidAt = new Date(inv.timestamps.paidAt!)
                        return paidAt >= fourWeeksAgo
                    })
                    .reduce(
                        (sum, inv) =>
                            sum +
                            calculateAmountWithCoupon(inv.amount, inv.coupon),
                        0
                    )

                setFinancialData({
                    totalRevenue: totalRevenue / 100,
                    monthToDate: monthToDate / 100,
                    lastFourWeeks: lastFourWeeks / 100,
                    pendingInvoices: pendingInvoicesResponse.total,
                })
            } catch (error) {
                console.error('Error loading financial data:', error)
                setFinancialData({
                    totalRevenue: 0,
                    monthToDate: 0,
                    lastFourWeeks: 0,
                    pendingInvoices: 0,
                })
            }
            setIsLoadingFinancial(false)
        }
        loadFinancialData()
    }, [user])

    useEffect(() => {
        const loadServiceData = async () => {
            setIsLoadingServices(true)
            try {
                const [allServices, active, suspended, cancelled] =
                    await Promise.all([
                        fetchServices({ limit: 1 }),
                        fetchServices({
                            status: ServiceStatus.ACTIVE,
                            limit: 1,
                        }),
                        fetchServices({
                            status: ServiceStatus.SUSPENDED,
                            limit: 1,
                        }),
                        fetchServices({
                            status: ServiceStatus.CANCELLED,
                            limit: 1,
                        }),
                    ])

                setServiceData({
                    totalServices: allServices.pagination.total,
                    activeServices: active.pagination.total,
                    suspendedServices: suspended.pagination.total,
                    cancelledServices: cancelled.pagination.total,
                })
            } catch (error) {
                console.error('Error loading service data:', error)
                setServiceData({
                    totalServices: 0,
                    activeServices: 0,
                    suspendedServices: 0,
                    cancelledServices: 0,
                })
            }
            setIsLoadingServices(false)
        }
        loadServiceData()
    }, [])

    useEffect(() => {
        if (user?.role !== UserRole.ADMIN) {
            setTimeout(() => {
                setIsLoadingPerformance(false)
            }, 0)
            return
        }

        const loadPerformanceData = async () => {
            setIsLoadingPerformance(true)
            try {
                const allInvoicesResponse = await fetchInvoices({
                    limit: 1000,
                })
                const paidInvoices = allInvoicesResponse.invoices.filter(
                    (inv) => inv.status === InvoiceStatus.PAID
                )

                const totalPaidInvoices = paidInvoices.length

                const totalAmount = paidInvoices.reduce(
                    (sum, inv) =>
                        sum + calculateAmountWithCoupon(inv.amount, inv.coupon),
                    0
                )

                const averageCost =
                    totalPaidInvoices > 0
                        ? totalAmount / totalPaidInvoices / 100
                        : 0

                const invoicesWithServiceId = paidInvoices.filter(
                    (inv) => inv.serviceId
                )
                const renewalRate =
                    totalPaidInvoices > 0
                        ? (invoicesWithServiceId.length / totalPaidInvoices) *
                          100
                        : 0

                setPerformanceData({
                    totalPaidInvoices,
                    averageCost,
                    renewalRate,
                })
            } catch (error) {
                console.error('Error loading performance data:', error)
                setPerformanceData({
                    totalPaidInvoices: 0,
                    averageCost: 0,
                    renewalRate: 0,
                })
            }
            setIsLoadingPerformance(false)
        }
        loadPerformanceData()
    }, [user])

    if (!user) return null

    const username = user.profile?.username || 'Admin'
    const avatarUrl = user.profile?.avatarUrl

    return (
        <div className="min-h-screen bg-black p-4 pb-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-4 rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-xl font-bold text-white uppercase">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={username}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span>{username.slice(0, 2)}</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-white">
                            Welcome back, {username}
                        </h1>
                        <p className="text-sm text-zinc-400">
                            You&apos;re logged in as an admin. See some
                            statistics for your application below.
                        </p>
                    </div>
                </div>

                <div
                    className={`grid grid-cols-1 ${user?.role === UserRole.ADMIN ? 'lg:grid-cols-2' : ''} mb-4 gap-4`}
                >
                    <UserMetricsCard
                        totalUsers={totalUsers}
                        verifiedUsers={verifiedUsers}
                        adminUsers={adminUsers}
                        isLoading={isLoadingUsers}
                    />
                    {user?.role === UserRole.ADMIN && (
                        <FinancialSnapshotCard
                            totalRevenue={financialData.totalRevenue}
                            monthToDate={financialData.monthToDate}
                            lastFourWeeks={financialData.lastFourWeeks}
                            pendingInvoices={financialData.pendingInvoices}
                            isLoading={isLoadingFinancial}
                        />
                    )}
                </div>

                <div
                    className={`grid grid-cols-1 ${user?.role === UserRole.ADMIN ? 'lg:grid-cols-2' : ''} gap-4`}
                >
                    <ServiceOverviewCard
                        totalServices={serviceData.totalServices}
                        activeServices={serviceData.activeServices}
                        suspendedServices={serviceData.suspendedServices}
                        cancelledServices={serviceData.cancelledServices}
                        isLoading={isLoadingServices}
                    />
                    {user?.role === UserRole.ADMIN && (
                        <BusinessPerformanceCard
                            totalPaidInvoices={
                                performanceData.totalPaidInvoices
                            }
                            averageCost={performanceData.averageCost}
                            renewalRate={performanceData.renewalRate}
                            isLoading={isLoadingPerformance}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
