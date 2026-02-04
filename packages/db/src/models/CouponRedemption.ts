import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import type { CouponRedemption } from '@fluxo/types'

const couponRedemptionSchema = new Schema<CouponRedemption>({
    uuid: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4(),
    },
    couponUuid: { type: String, required: true },
    userUuid: { type: String, required: true },
    serviceUuid: { type: String, required: false },
    redeemedAt: { type: Date, required: true, default: Date.now },
})

couponRedemptionSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }
    next()
})

couponRedemptionSchema.index({ uuid: 1 })
couponRedemptionSchema.index({ couponUuid: 1 })
couponRedemptionSchema.index({ userUuid: 1 })
couponRedemptionSchema.index({ serviceUuid: 1 })

export const CouponRedemptionModel = model<CouponRedemption>(
    'CouponRedemption',
    couponRedemptionSchema
)
