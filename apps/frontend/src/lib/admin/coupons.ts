import { apiClient } from '@/lib/api-client'
import {
    type Coupon,
    type CouponType,
    type CouponDurationType,
} from '@fluxo/types'

export interface CouponFilters {
    page?: number
    limit?: number
    search?: string
}

export interface CouponStats {
    redemptionCount: number
    maxRedemptions: number | null
    isExpired: boolean
    isMaxedOut: boolean
    isActive: boolean
}

export interface FetchCouponsResponse {
    success: boolean
    message: string
    coupons: Coupon[]
    total: number
    page: number
    totalPages: number
}

export interface CouponResponse {
    success: boolean
    message: string
    coupon: Coupon
}

export interface CouponStatsResponse {
    success: boolean
    message: string
    stats: CouponStats
}

export interface DeleteResponse {
    success: boolean
    message: string
}

export interface CreateCouponData {
    userUuid?: string | null
    code: string
    type: CouponType
    value: number
    duration: {
        type: CouponDurationType
        count?: number
    }
    maxRedemptions?: number
    expiresAt?: Date | string
}

export interface UpdateCouponData {
    userUuid?: string | null
    code?: string
    type?: CouponType
    value?: number
    duration?: {
        type: CouponDurationType
        count?: number
    }
    maxRedemptions?: number
    expiresAt?: Date | string | null
}

export async function fetchCoupons(
    params: CouponFilters = {}
): Promise<FetchCouponsResponse> {
    try {
        const queryParams = new URLSearchParams()

        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)

        const response = await apiClient.get(
            `/admin/coupons?${queryParams.toString()}`,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error) {
        console.error('Failed to fetch coupons:', error)
        return {
            success: false,
            message: 'Failed to fetch coupons',
            coupons: [],
            total: 0,
            page: 1,
            totalPages: 0,
        }
    }
}

export async function fetchCouponById(
    couponId: string
): Promise<Coupon | null> {
    try {
        const response = await apiClient.get(`/admin/coupons/id/${couponId}`, {
            withCredentials: true,
        })

        return response.data.coupon
    } catch (error) {
        console.error('Failed to fetch coupon:', error)
        return null
    }
}

export async function fetchCouponByCode(code: string): Promise<Coupon | null> {
    try {
        const response = await apiClient.get(`/admin/coupons/code/${code}`, {
            withCredentials: true,
        })

        return response.data.coupon
    } catch (error) {
        console.error('Failed to fetch coupon by code:', error)
        return null
    }
}

export async function fetchCouponStats(
    couponId: string
): Promise<CouponStats | null> {
    try {
        const response = await apiClient.get(
            `/admin/coupons/${couponId}/stats`,
            {
                withCredentials: true,
            }
        )

        return response.data.stats
    } catch (error) {
        console.error('Failed to fetch coupon stats:', error)
        return null
    }
}

export async function createCoupon(
    data: CreateCouponData
): Promise<CouponResponse> {
    try {
        const response = await apiClient.post(`/admin/coupons`, data, {
            withCredentials: true,
        })

        return response.data
    } catch (error: unknown) {
        console.error('Failed to create coupon:', error)
        throw error
    }
}

export async function updateCoupon(
    couponId: string,
    data: UpdateCouponData
): Promise<CouponResponse> {
    try {
        const response = await apiClient.put(
            `/admin/coupons/${couponId}`,
            data,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to update coupon:', error)
        throw error
    }
}

export async function deleteCoupon(couponId: string): Promise<DeleteResponse> {
    try {
        const response = await apiClient.delete(`/admin/coupons/${couponId}`, {
            withCredentials: true,
        })

        return response.data
    } catch (error: unknown) {
        console.error('Failed to delete coupon:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to delete coupon',
        }
    }
}
