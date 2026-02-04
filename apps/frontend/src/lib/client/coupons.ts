import axios from 'axios'
import { Coupon } from '@fluxo/types'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

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
        const response = await axios.post(
            `${API_URL}/client/validate-coupon`,
            { code },
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data) {
            return error.response.data
        }
        throw error
    }
}
