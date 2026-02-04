import mongoose, { Document, Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface INewsRead extends Document {
    uuid: string
    newsUuid: string
    userUuid: string
    readAt: Date
}

const newsReadSchema = new Schema<INewsRead>(
    {
        uuid: {
            type: String,
            default: () => uuidv4(),
            unique: true,
            required: true,
        },
        newsUuid: {
            type: String,
            required: true,
            index: true,
        },
        userUuid: {
            type: String,
            required: true,
            index: true,
        },
        readAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: false,
    }
)

newsReadSchema.index({ newsUuid: 1, userUuid: 1 }, { unique: true })

export const NewsReadModel = mongoose.model<INewsRead>(
    'NewsRead',
    newsReadSchema
)
