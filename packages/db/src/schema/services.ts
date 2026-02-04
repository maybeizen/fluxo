import {
    pgTable,
    serial,
    varchar,
    integer,
    boolean,
    timestamp,
    text,
    doublePrecision,
    index,
} from 'drizzle-orm/pg-core'
import { serviceStatusEnum } from './enums'
import { users } from './users'
import { products } from './products'

export const services = pgTable(
    'services',
    {
        id: serial('id').primaryKey(),

        productId: integer('product_id')
            .notNull()
            .references(() => products.id, { onDelete: 'restrict' }),
        serviceOwnerId: integer('service_owner_id')
            .notNull()
            .references(() => users.id, { onDelete: 'restrict' }),

        serviceName: varchar('service_name', { length: 255 }).notNull(),
        externalId: varchar('external_id', { length: 255 }).default(''),

        status: serviceStatusEnum('status').notNull(),
        monthlyPrice: doublePrecision('monthly_price').notNull(),
        dueDate: timestamp('due_date').notNull(),
        creationError: boolean('creation_error').notNull().default(false),

        location: varchar('location', { length: 255 }).notNull(),
        dedicatedIp: boolean('dedicated_ip').notNull().default(false),
        proxyAddon: boolean('proxy_addon').notNull().default(false),

        isCancelled: boolean('is_cancelled').notNull().default(false),
        cancellationReason: text('cancellation_reason'),
        cancellationDate: timestamp('cancellation_date'),

        isSuspended: boolean('is_suspended').notNull().default(false),
        suspensionReason: text('suspension_reason'),
        suspensionDate: timestamp('suspension_date'),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        serviceOwnerIdx: index('services_service_owner_idx').on(
            table.serviceOwnerId
        ),
        productIdx: index('services_product_idx').on(table.productId),
        statusIdx: index('services_status_idx').on(table.status),
        dueDateIdx: index('services_due_date_idx').on(table.dueDate),
    })
)
