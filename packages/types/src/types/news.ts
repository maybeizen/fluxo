export enum NewsVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
    DRAFT = 'draft',
    ARCHIVED = 'archived',
}

export interface NewsAuthor {
    uuid: string
    name?: string
    email?: string
    username?: string
    avatarUrl?: string
}

export interface NewsTimestamps {
    createdAt: Date
    publishedAt?: Date
    updatedAt: Date
}

export interface NewsMetadata {
    slug: string
    featuredImageUrl?: string
    seoTitle?: string
    seoDescription?: string
}

export interface NewsReactions {
    likes: number
    dislikes: number
}

export interface NewsComment {
    uuid: string
    content: string
    author: NewsAuthor
    createdAt: Date
}

export interface News {
    uuid: string
    title: string
    content: string
    summary: string
    isFeatured: boolean
    tags: string[]
    author: NewsAuthor[]
    comments: NewsComment[]
    visibility: NewsVisibility
    reactions: NewsReactions
    metadata: NewsMetadata
    timestamps: NewsTimestamps
}
