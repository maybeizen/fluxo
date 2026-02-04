export enum CouponType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}

export enum CouponDurationType {
    ONCE = 'once',
    REPEATING = 'repeating',
    FOREVER = 'forever',
}

export interface CouponTimestamps {
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date | null
}

export interface Coupon {
    uuid: string
    userUuid: string | null
    code: string
    type: CouponType
    value: number
    duration: {
        type: CouponDurationType
        count?: number
    }
    maxRedemptions?: number
    expiresAt?: Date
    timestamps: CouponTimestamps
}
