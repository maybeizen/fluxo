import {
    pgTable,
    serial,
    varchar,
    integer,
    timestamp,
    doublePrecision,
    index,
} from 'drizzle-orm/pg-core'
import { couponTypeEnum, couponDurationTypeEnum } from './enums'
import { users } from './users'
import { services } from './services'

export const coupons = pgTable(
    'coupons',
    {
        id: serial('id').primaryKey(),

        userId: integer('user_id').references(() => users.id, {
            onDelete: 'set null',
        }),

        code: varchar('code', { length: 255 }).notNull().unique(),
        type: couponTypeEnum('type').notNull(),
        value: doublePrecision('value').notNull(),

        durationType: couponDurationTypeEnum('duration_type').notNull(),
        durationCount: integer('duration_count'),

        maxRedemptions: integer('max_redemptions'),
        expiresAt: timestamp('expires_at'),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => ({
        codeIdx: index('coupons_code_idx').on(table.code),
        userIdIdx: index('coupons_user_id_idx').on(table.userId),
        deletedAtIdx: index('coupons_deleted_at_idx').on(table.deletedAt),
    })
)

export const couponRedemptions = pgTable(
    'coupon_redemptions',
    {
        id: serial('id').primaryKey(),
        couponId: integer('coupon_id')
            .notNull()
            .references(() => coupons.id, { onDelete: 'restrict' }),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'restrict' }),
        serviceId: integer('service_id').references(() => services.id, {
            onDelete: 'set null',
        }),
        redeemedAt: timestamp('redeemed_at').notNull().defaultNow(),
    },
    (table) => ({
        couponIdIdx: index('coupon_redemptions_coupon_id_idx').on(
            table.couponId
        ),
        userIdIdx: index('coupon_redemptions_user_id_idx').on(table.userId),
        serviceIdIdx: index('coupon_redemptions_service_id_idx').on(
            table.serviceId
        ),
    })
)
