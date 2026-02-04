import {
    pgTable,
    serial,
    varchar,
    integer,
    text,
    timestamp,
    boolean,
    jsonb,
    unique,
    index,
} from 'drizzle-orm/pg-core'
import { newsVisibilityEnum, newsReactionTypeEnum } from './enums'
import { users } from './users'

export const news = pgTable(
    'news',
    {
        id: serial('id').primaryKey(),

        title: varchar('title', { length: 255 }).notNull(),
        content: text('content').notNull(),
        summary: text('summary').notNull(),
        isFeatured: boolean('is_featured').notNull().default(false),
        tags: jsonb('tags').$type<string[]>().notNull().default([]),
        visibility: newsVisibilityEnum('visibility').notNull().default('draft'),

        slug: varchar('slug', { length: 255 }).notNull().unique(),
        featuredImageUrl: varchar('featured_image_url', { length: 500 }),
        seoTitle: varchar('seo_title', { length: 255 }),
        seoDescription: text('seo_description'),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        publishedAt: timestamp('published_at'),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        slugIdx: index('news_slug_idx').on(table.slug),
        visibilityIdx: index('news_visibility_idx').on(table.visibility),
        isFeaturedIdx: index('news_is_featured_idx').on(table.isFeatured),
        publishedAtIdx: index('news_published_at_idx').on(table.publishedAt),
        createdAtIdx: index('news_created_at_idx').on(table.createdAt),
    })
)

export const newsAuthors = pgTable(
    'news_authors',
    {
        id: serial('id').primaryKey(),
        newsId: integer('news_id')
            .notNull()
            .references(() => news.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
    },
    (table) => ({
        uniqueNewsUser: unique().on(table.newsId, table.userId),
    })
)

export const newsComments = pgTable('news_comments', {
    id: serial('id').primaryKey(),
    newsId: integer('news_id')
        .notNull()
        .references(() => news.id, { onDelete: 'cascade' }),
    authorId: integer('author_id')
        .notNull()
        .references(() => users.id, { onDelete: 'restrict' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const newsReactions = pgTable(
    'news_reactions',
    {
        id: serial('id').primaryKey(),
        newsId: integer('news_id')
            .notNull()
            .references(() => news.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        reactionType: newsReactionTypeEnum('reaction_type').notNull(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        uniqueNewsUser: unique().on(table.newsId, table.userId),
    })
)

export const newsRead = pgTable(
    'news_read',
    {
        id: serial('id').primaryKey(),
        newsId: integer('news_id')
            .notNull()
            .references(() => news.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        readAt: timestamp('read_at').notNull().defaultNow(),
    },
    (table) => ({
        uniqueNewsUser: unique().on(table.newsId, table.userId),
    })
)
