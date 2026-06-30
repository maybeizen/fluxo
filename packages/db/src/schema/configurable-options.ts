import {
    pgTable,
    serial,
    varchar,
    integer,
    timestamp,
    jsonb,
    boolean,
    index,
    uniqueIndex,
} from 'drizzle-orm/pg-core'
import { configurableOptionPricingTypeEnum } from './enums'
import { products } from './products'
import { users } from './users'
import { invoices } from './invoices'
import { plugins } from './plugins'

export const configurableOptions = pgTable(
    'configurable_options',
    {
        id: serial('id').primaryKey(),
        pluginId: varchar('plugin_id', { length: 64 })
            .notNull()
            .references(() => plugins.id, { onDelete: 'restrict' }),
        fieldKey: varchar('field_key', { length: 255 }).notNull(),
        label: varchar('label', { length: 255 }),
        /** Display/input type: text, number, checkbox, select. When null, derived from plugin field. */
        type: varchar('type', { length: 32 }),
        defaultValue: jsonb('default_value').$type<unknown>(),
        order: integer('order').notNull().default(0),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        pluginIdIdx: index('configurable_options_plugin_id_idx').on(
            table.pluginId
        ),
        fieldKeyIdx: index('configurable_options_field_key_idx').on(
            table.fieldKey
        ),
    })
)

export const configurableOptionScopes = pgTable(
    'configurable_option_scopes',
    {
        id: serial('id').primaryKey(),
        optionId: integer('option_id')
            .notNull()
            .references(() => configurableOptions.id, { onDelete: 'cascade' }),
        productId: integer('product_id').references(() => products.id, {
            onDelete: 'cascade',
        }),
        defaultValue: jsonb('default_value').$type<unknown>(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        optionIdIdx: index('configurable_option_scopes_option_id_idx').on(
            table.optionId
        ),
        productIdIdx: index('configurable_option_scopes_product_id_idx').on(
            table.productId
        ),
        optionProductUnique: uniqueIndex(
            'configurable_option_scopes_option_product_unique'
        ).on(table.optionId, table.productId),
    })
)

export const configurableOptionPricing = pgTable(
    'configurable_option_pricing',
    {
        id: serial('id').primaryKey(),
        optionId: integer('option_id')
            .notNull()
            .references(() => configurableOptions.id, { onDelete: 'cascade' })
            .unique(),
        pricingType:
            configurableOptionPricingTypeEnum('pricing_type').notNull(),
        amount: integer('amount').notNull(),
        useValueAsMultiplier: boolean('use_value_as_multiplier')
            .notNull()
            .default(false),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        optionIdIdx: index('configurable_option_pricing_option_id_idx').on(
            table.optionId
        ),
    })
)

export const userConfigSelections = pgTable(
    'user_config_selections',
    {
        id: serial('id').primaryKey(),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        optionId: integer('option_id')
            .notNull()
            .references(() => configurableOptions.id, { onDelete: 'cascade' }),
        value: jsonb('value').notNull().$type<unknown>(),
        invoiceId: integer('invoice_id').references(() => invoices.id, {
            onDelete: 'set null',
        }),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => ({
        userIdOptionIdIdx: index('user_config_selections_user_option_idx').on(
            table.userId,
            table.optionId
        ),
        invoiceIdIdx: index('user_config_selections_invoice_id_idx').on(
            table.invoiceId
        ),
    })
)
