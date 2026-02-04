import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import {
    CancelledInfo,
    ServiceStatus,
    type Service,
    type SuspendedInfo,
} from '@fluxo/types'

const CancelledInfoSchema = new Schema<CancelledInfo>({
    isCancelled: { type: Boolean, required: true, default: false },
    cancellationReason: { type: String, required: false },
    cancellationDate: { type: Date, required: false },
})

const SuspendedInfoSchema = new Schema<SuspendedInfo>({
    isSuspended: { type: Boolean, required: true, default: false },
    suspensionReason: { type: String, required: false },
    suspensionDate: { type: Date, required: false },
})

const serviceSchema = new Schema<Service>(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        product: { type: String, required: true },
        serviceName: { type: String, required: true },
        serviceOwnerId: { type: String, required: true },
        externalId: { type: String, required: false, default: '' },

        status: {
            type: String,
            required: true,
            enum: Object.values(ServiceStatus),
        },
        monthlyPrice: { type: Number, required: true },
        dueDate: { type: Date, required: true },
        creationError: { type: Boolean, required: true },

        location: { type: String, required: true },
        dedicatedIp: { type: Boolean, required: true },
        proxyAddon: { type: Boolean, required: true },

        cancelled: { type: CancelledInfoSchema, required: true },
        suspended: { type: SuspendedInfoSchema, required: true },

        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now },
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        },
    }
)

serviceSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }
    next()
})

serviceSchema.index({ uuid: 1 })
serviceSchema.index({ serviceOwnerId: 1 })

export const ServiceModel = model<Service>('Service', serviceSchema)
