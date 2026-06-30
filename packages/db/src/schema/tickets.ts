import {
    pgTable,
    serial,
    varchar,
    integer,
    text,
    timestamp,
    index,
} from 'drizzle-orm/pg-core'
import { ticketStatusEnum, ticketTypeEnum } from './enums'
import { users } from './users'

export const tickets = pgTable(
    'tickets',
    {
        id: serial('id').primaryKey(),

        userId: integer('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'restrict' }),
        assignedToId: integer('assigned_to_id').references(() => users.id, {
            onDelete: 'set null',
        }),

        title: varchar('title', { length: 255 }).notNull(),
        content: text('content').notNull(),
        status: ticketStatusEnum('status').notNull().default('open'),
        type: ticketTypeEnum('type').notNull().default('general'),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
        respondedToAt: timestamp('responded_to_at'),
        closedAt: timestamp('closed_at'),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => ({
        userIdIdx: index('tickets_user_id_idx').on(table.userId),
        assignedToIdx: index('tickets_assigned_to_idx').on(table.assignedToId),
        statusIdx: index('tickets_status_idx').on(table.status),
        typeIdx: index('tickets_type_idx').on(table.type),
        createdAtIdx: index('tickets_created_at_idx').on(table.createdAt),
    })
)

export const ticketMessages = pgTable(
    'ticket_messages',
    {
        id: serial('id').primaryKey(),
        ticketId: integer('ticket_id')
            .notNull()
            .references(() => tickets.id, { onDelete: 'cascade' }),
        authorId: integer('author_id')
            .notNull()
            .references(() => users.id, { onDelete: 'restrict' }),
        content: text('content').notNull(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => ({
        ticketIdIdx: index('ticket_messages_ticket_id_idx').on(table.ticketId),
        authorIdIdx: index('ticket_messages_author_id_idx').on(table.authorId),
        createdAtIdx: index('ticket_messages_created_at_idx').on(
            table.createdAt
        ),
    })
)
