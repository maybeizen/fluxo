import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import {
    TicketStatus,
    TicketType,
    type Ticket,
    type TicketTimestamps,
} from '@fluxo/types'

const TicketTimestampsSchema = new Schema<TicketTimestamps>({
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    respondedToAt: { type: Date, required: false },
    closedAt: { type: Date, required: false },
    deletedAt: { type: Date, required: false },
})

const ticketSchema = new Schema<Ticket>(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        userId: { type: String, required: true },
        assignedToId: { type: String, required: false },
        title: { type: String, required: true },
        content: { type: String, required: true },
        status: {
            type: String,
            required: true,
            enum: Object.values(TicketStatus),
            default: TicketStatus.OPEN,
        },
        type: {
            type: String,
            required: true,
            enum: Object.values(TicketType),
            default: TicketType.GENERAL,
        },
        timestamps: { type: TicketTimestampsSchema, required: true },
    },
    {
        timestamps: {
            createdAt: 'timestamps.createdAt',
            updatedAt: 'timestamps.updatedAt',
        },
    }
)

ticketSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }

    if (this.isModified('status')) {
        if (this.status === TicketStatus.CLOSED && !this.timestamps.closedAt) {
            this.timestamps.closedAt = new Date()
        } else if (
            this.status === TicketStatus.DELETED &&
            !this.timestamps.deletedAt
        ) {
            this.timestamps.deletedAt = new Date()
        }
    }

    next()
})

ticketSchema.index({ uuid: 1 })
ticketSchema.index({ userId: 1 })
ticketSchema.index({ assignedToId: 1 })
ticketSchema.index({ status: 1 })
ticketSchema.index({ type: 1 })
ticketSchema.index({ 'timestamps.createdAt': -1 })
ticketSchema.index({ 'timestamps.updatedAt': -1 })

export const TicketModel = model<Ticket>('Ticket', ticketSchema)
