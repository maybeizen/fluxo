import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { type Category } from '@fluxo/types'

const categorySchema = new Schema<Category>(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        },
    }
)

categorySchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }
    this.updatedAt = new Date()
    next()
})

categorySchema.index({ uuid: 1 })
categorySchema.index({ name: 1 })

export const CategoryModel = model<Category>('Category', categorySchema)
