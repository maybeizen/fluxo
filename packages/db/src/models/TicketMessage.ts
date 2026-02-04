import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { type TicketMessage } from '@fluxo/types'

const ticketMessageSchema = new Schema<TicketMessage>(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        ticketUuid: { type: String, required: true },
        content: { type: String, required: true },
        authorId: { type: String, required: true },
        createdAt: { type: Date, required: true, default: Date.now },
    },
    {
        timestamps: false,
    }
)

ticketMessageSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }
    next()
})

ticketMessageSchema.index({ uuid: 1 })
ticketMessageSchema.index({ ticketUuid: 1 })
ticketMessageSchema.index({ authorId: 1 })
ticketMessageSchema.index({ createdAt: -1 })

export const TicketMessageModel = model<TicketMessage>(
    'TicketMessage',
    ticketMessageSchema
)
