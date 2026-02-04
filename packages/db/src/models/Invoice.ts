import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import {
    InvoiceStatus,
    PaymentProvider,
    type Invoice,
    type InvoiceTimestamps,
    type InvoiceItem,
    type InvoiceCoupon,
} from '@fluxo/types'

const InvoiceTimestampsSchema = new Schema<InvoiceTimestamps>({
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    paidAt: { type: Date, required: false },
    expiresAt: { type: Date, required: true },
    expiredAt: { type: Date, required: false },
})

const InvoiceItemSchema = new Schema<InvoiceItem>({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
})

const InvoiceCouponSchema = new Schema<InvoiceCoupon>(
    {
        code: { type: String, required: true },
        type: { type: String, required: true },
        value: { type: Number, required: true },
    },
    { _id: false }
)

const invoiceSchema = new Schema<Invoice>(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        userId: { type: String, required: true },
        serviceId: { type: String, required: false },
        transactionId: { type: String, required: false },
        items: { type: [InvoiceItemSchema], required: true },
        status: {
            type: String,
            required: true,
            enum: Object.values(InvoiceStatus),
            default: InvoiceStatus.PENDING,
        },
        amount: { type: Number, required: true },
        currency: { type: String, required: true, default: 'usd' },
        metadata: { type: Schema.Types.Mixed, required: false },
        paymentProvider: {
            type: String,
            required: false,
            enum: Object.values(PaymentProvider),
            default: null,
        },
        coupon: { type: InvoiceCouponSchema, required: false },
        timestamps: { type: InvoiceTimestampsSchema, required: true },
    },
    {
        timestamps: {
            createdAt: 'timestamps.createdAt',
            updatedAt: 'timestamps.updatedAt',
        },
    }
)

invoiceSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }
    next()
})

invoiceSchema.index({ uuid: 1 })
invoiceSchema.index({ userId: 1 })
invoiceSchema.index({ serviceId: 1 })
invoiceSchema.index({ transactionId: 1 })
invoiceSchema.index({ status: 1 })
invoiceSchema.index({ 'timestamps.expiresAt': 1 })
invoiceSchema.index({ 'timestamps.createdAt': -1 })

export const InvoiceModel = model<Invoice>('Invoice', invoiceSchema)
