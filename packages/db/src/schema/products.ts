import {
    pgTable,
    serial,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    jsonb,
    doublePrecision,
    index,
} from 'drizzle-orm/pg-core'
import { categories } from './categories'

export const products = pgTable(
    'products',
    {
        id: serial('id').primaryKey(),

        name: varchar('name', { length: 255 }).notNull(),
        description: text('description').notNull(),
        price: doublePrecision('price').notNull(),
        tags: jsonb('tags').$type<string[]>().notNull().default([]),

        cpu: integer('cpu').notNull(),
        ram: integer('ram').notNull(),
        storage: integer('storage').notNull(),
        ports: integer('ports').notNull(),
        databases: integer('databases').notNull(),
        backups: integer('backups').notNull(),

        hidden: boolean('hidden').notNull().default(false),
        disabled: boolean('disabled').notNull().default(false),
        allowCoupons: boolean('allow_coupons').notNull().default(true),

        stockEnabled: boolean('stock_enabled').notNull().default(false),
        stock: integer('stock'),

        categoryId: integer('category_id').references(() => categories.id, {
            onDelete: 'set null',
        }),
        order: integer('order').notNull().default(0),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        nameIdx: index('products_name_idx').on(table.name),
        hiddenIdx: index('products_hidden_idx').on(table.hidden),
        disabledIdx: index('products_disabled_idx').on(table.disabled),
        categoryIdIdx: index('products_category_id_idx').on(table.categoryId),
        orderIdx: index('products_order_idx').on(table.order),
    })
)

export const productIntegrations = pgTable('product_integrations', {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'cascade' })
        .unique(),

    enabled: boolean('enabled').notNull().default(false),
    locationId: integer('location_id'),
    nodeId: integer('node_id'),
    nestId: integer('nest_id'),
    eggId: integer('egg_id'),
    memory: integer('memory'),
    swap: integer('swap'),
    disk: integer('disk'),
    io: integer('io'),
    cpu: integer('cpu'),
    cpuPinning: varchar('cpu_pinning', { length: 255 }),
    databases: integer('databases'),
    backups: integer('backups'),
    additionalAllocations: integer('additional_allocations'),
    oomKiller: boolean('oom_killer').default(false),
    skipEggInstallScript: boolean('skip_egg_install_script').default(false),
    startOnCompletion: boolean('start_on_completion').default(true),

    servicePluginId: varchar('service_plugin_id', { length: 64 }),
    servicePluginConfig: jsonb('service_plugin_config').$type<
        Record<string, unknown>
    >(),
})
