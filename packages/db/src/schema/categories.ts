import {
    pgTable,
    serial,
    varchar,
    text,
    timestamp,
    index,
} from 'drizzle-orm/pg-core'

export const categories = pgTable(
    'categories',
    {
        id: serial('id').primaryKey(),
        name: varchar('name', { length: 100 }).notNull(),
        description: text('description'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        nameIdx: index('categories_name_idx').on(table.name),
    })
)
