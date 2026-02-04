import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import {
    CouponType,
    CouponDurationType,
    type Coupon,
    type CouponTimestamps,
} from '@fluxo/types'

const CouponTimestampsSchema = new Schema<CouponTimestamps>({
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    deletedAt: { type: Date, required: false, default: null },
})

const couponSchema = new Schema<Coupon>(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        userUuid: { type: String, required: false, default: null },
        code: { type: String, required: true, unique: true },
        type: {
            type: String,
            required: true,
            enum: Object.values(CouponType),
        },
        value: { type: Number, required: true },
        duration: {
            type: {
                type: String,
                required: true,
                enum: Object.values(CouponDurationType),
            },
            count: { type: Number, required: false },
        },
        maxRedemptions: { type: Number, required: false },
        expiresAt: { type: Date, required: false },
        timestamps: { type: CouponTimestampsSchema, required: true },
    },
    {
        timestamps: {
            createdAt: 'timestamps.createdAt',
            updatedAt: 'timestamps.updatedAt',
        },
    }
)

couponSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }
    next()
})

couponSchema.index({ uuid: 1 })
couponSchema.index({ code: 1 })
couponSchema.index({ userUuid: 1 })
couponSchema.index({ 'timestamps.deletedAt': 1 })

export const CouponModel = model<Coupon>('Coupon', couponSchema)
