export interface CouponRedemption {
    uuid: string
    couponUuid: string
    userUuid: string
    serviceUuid?: string
    redeemedAt: Date
}
