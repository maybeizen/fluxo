import {
    pgTable,
    serial,
    varchar,
    integer,
    timestamp,
    doublePrecision,
    text,
    index,
} from 'drizzle-orm/pg-core'
import { invoiceStatusEnum, paymentProviderEnum, couponTypeEnum } from './enums'
import { users } from './users'
import { services } from './services'

export const invoices = pgTable(
    'invoices',
    {
        id: serial('id').primaryKey(),

        userId: integer('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'restrict' }),
        serviceId: integer('service_id').references(() => services.id, {
            onDelete: 'set null',
        }),

        transactionId: varchar('transaction_id', { length: 255 }),

        status: invoiceStatusEnum('status').notNull().default('pending'),
        amount: doublePrecision('amount').notNull(),
        currency: varchar('currency', { length: 10 }).notNull().default('usd'),

        paymentProvider: paymentProviderEnum('payment_provider'),
        gatewayPluginId: varchar('gateway_plugin_id', { length: 64 }),
        paymentProviderKey: varchar('payment_provider_key', { length: 64 }),

        couponCode: varchar('coupon_code', { length: 255 }),
        couponType: couponTypeEnum('coupon_type'),
        couponValue: doublePrecision('coupon_value'),

        metadata: text('metadata'),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
        paidAt: timestamp('paid_at'),
        expiresAt: timestamp('expires_at').notNull(),
        expiredAt: timestamp('expired_at'),
    },
    (table) => ({
        userIdIdx: index('invoices_user_id_idx').on(table.userId),
        serviceIdIdx: index('invoices_service_id_idx').on(table.serviceId),
        statusIdx: index('invoices_status_idx').on(table.status),
        expiresAtIdx: index('invoices_expires_at_idx').on(table.expiresAt),
        transactionIdIdx: index('invoices_transaction_id_idx').on(
            table.transactionId
        ),
    })
)

export const invoiceItems = pgTable('invoice_items', {
    id: serial('id').primaryKey(),
    invoiceId: integer('invoice_id')
        .notNull()
        .references(() => invoices.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: doublePrecision('unit_price').notNull(),
    total: doublePrecision('total').notNull(),
})
