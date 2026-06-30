import { apiClient, isApiError } from '@/lib/api-client'
import { Coupon } from '@fluxo/types'

export interface ValidateCouponResponse {
    success: boolean
    message: string
    coupon?: {
        code: string
        type: string
        value: number
        duration: {
            type: string
            count?: number
        }
    }
}

export async function validateCoupon(
    code: string
): Promise<ValidateCouponResponse> {
    try {
        const response = await apiClient.post('/client/validate-coupon', {
            code,
        })

        return response.data
    } catch (error: unknown) {
        if (isApiError(error) && error.response?.data) {
            return error.response.data as ValidateCouponResponse
        }
        throw error
    }
}
