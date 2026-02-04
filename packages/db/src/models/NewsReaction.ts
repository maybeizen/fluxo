import mongoose, { Document, Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface INewsReaction extends Document {
    uuid: string
    newsUuid: string
    userUuid: string
    reactionType: 'like' | 'dislike'
    createdAt: Date
    updatedAt: Date
}

const newsReactionSchema = new Schema<INewsReaction>(
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
        reactionType: {
            type: String,
            enum: ['like', 'dislike'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

newsReactionSchema.index({ newsUuid: 1, userUuid: 1 }, { unique: true })

export const NewsReactionModel = mongoose.model<INewsReaction>(
    'NewsReaction',
    newsReactionSchema
)
