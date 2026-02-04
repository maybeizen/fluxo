import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import {
    NewsVisibility,
    type News,
    type NewsAuthor,
    type NewsComment,
    type NewsMetadata,
    type NewsReactions,
    type NewsTimestamps,
} from '@fluxo/types'

const NewsAuthorSchema = new Schema<NewsAuthor>({
    uuid: { type: String, required: true },
})

const NewsCommentSchema = new Schema<NewsComment>({
    uuid: { type: String, required: true, default: () => uuidv4() },
    content: { type: String, required: true },
    author: { type: NewsAuthorSchema, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
})

const NewsTimestampsSchema = new Schema<NewsTimestamps>({
    createdAt: { type: Date, required: true, default: Date.now },
    publishedAt: { type: Date, required: false },
    updatedAt: { type: Date, required: true, default: Date.now },
})

const NewsMetadataSchema = new Schema<NewsMetadata>({
    slug: { type: String, required: true, unique: true },
    featuredImageUrl: { type: String, required: false },
    seoTitle: { type: String, required: false },
    seoDescription: { type: String, required: false },
})

const NewsReactionsSchema = new Schema<NewsReactions>({
    likes: { type: Number, required: true, default: 0 },
    dislikes: { type: Number, required: true, default: 0 },
})

const newsSchema = new Schema<News>(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        title: { type: String, required: true },
        content: { type: String, required: true },
        summary: { type: String, required: true },
        isFeatured: { type: Boolean, required: true, default: false },
        tags: [{ type: String }],
        author: [{ type: NewsAuthorSchema, required: true }],
        comments: [{ type: NewsCommentSchema, default: [] }],
        visibility: {
            type: String,
            required: true,
            enum: Object.values(NewsVisibility),
            default: NewsVisibility.DRAFT,
        },
        reactions: {
            type: NewsReactionsSchema,
            required: true,
            default: () => ({}),
        },
        metadata: { type: NewsMetadataSchema, required: true },
        timestamps: { type: NewsTimestampsSchema, required: true },
    },
    {
        timestamps: {
            createdAt: 'timestamps.createdAt',
            updatedAt: 'timestamps.updatedAt',
        },
    }
)

newsSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }

    if (!this.metadata?.slug && this.title) {
        const baseSlug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        const suffix = Date.now()
        this.metadata = this.metadata || ({} as NewsMetadata)
        this.metadata.slug = `${baseSlug}-${suffix}`
    }

    if (
        this.isModified('visibility') &&
        this.visibility === NewsVisibility.PUBLIC &&
        !this.timestamps.publishedAt
    ) {
        this.timestamps.publishedAt = new Date()
    }

    next()
})

newsSchema.index({ uuid: 1 })
newsSchema.index({ 'metadata.slug': 1 })
newsSchema.index({ visibility: 1 })
newsSchema.index({ isFeatured: 1 })
newsSchema.index({ tags: 1 })
newsSchema.index({ 'timestamps.publishedAt': -1 })
newsSchema.index({ 'timestamps.createdAt': -1 })

export const NewsModel = model<News>('News', newsSchema)
