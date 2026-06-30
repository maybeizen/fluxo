import { relations } from 'drizzle-orm'
import {
    users,
    userDiscord,
    userPasswordReset,
    userEmailVerification,
} from './users'
import { categories } from './categories'
import { products, productIntegrations } from './products'
import { services } from './services'
import { invoices, invoiceItems } from './invoices'
import { coupons, couponRedemptions } from './coupons'
import { tickets, ticketMessages } from './tickets'
import {
    news,
    newsAuthors,
    newsComments,
    newsReactions,
    newsRead,
} from './news'
import {
    configurableOptions,
    configurableOptionScopes,
    configurableOptionPricing,
    userConfigSelections,
} from './configurable-options'

export const usersRelations = relations(users, ({ one, many }) => ({
    discord: one(userDiscord, {
        fields: [users.id],
        references: [userDiscord.userId],
    }),
    passwordReset: one(userPasswordReset, {
        fields: [users.id],
        references: [userPasswordReset.userId],
    }),
    emailVerification: one(userEmailVerification, {
        fields: [users.id],
        references: [userEmailVerification.userId],
    }),
    services: many(services),
    invoices: many(invoices),
    tickets: many(tickets),
    assignedTickets: many(tickets, { relationName: 'assignedTickets' }),
    ticketMessages: many(ticketMessages),
    couponRedemptions: many(couponRedemptions),
    newsAuthors: many(newsAuthors),
    newsComments: many(newsComments),
    newsReactions: many(newsReactions),
    newsRead: many(newsRead),
    configSelections: many(userConfigSelections),
}))

export const userDiscordRelations = relations(userDiscord, ({ one }) => ({
    user: one(users, {
        fields: [userDiscord.userId],
        references: [users.id],
    }),
}))

export const userPasswordResetRelations = relations(
    userPasswordReset,
    ({ one }) => ({
        user: one(users, {
            fields: [userPasswordReset.userId],
            references: [users.id],
        }),
    })
)

export const userEmailVerificationRelations = relations(
    userEmailVerification,
    ({ one }) => ({
        user: one(users, {
            fields: [userEmailVerification.userId],
            references: [users.id],
        }),
    })
)

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    integrations: one(productIntegrations, {
        fields: [products.id],
        references: [productIntegrations.productId],
    }),
    services: many(services),
    configurableOptionScopes: many(configurableOptionScopes),
}))

export const productIntegrationsRelations = relations(
    productIntegrations,
    ({ one }) => ({
        product: one(products, {
            fields: [productIntegrations.productId],
            references: [products.id],
        }),
    })
)

export const servicesRelations = relations(services, ({ one, many }) => ({
    product: one(products, {
        fields: [services.productId],
        references: [products.id],
    }),
    owner: one(users, {
        fields: [services.serviceOwnerId],
        references: [users.id],
    }),
    invoices: many(invoices),
    couponRedemptions: many(couponRedemptions),
}))

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    user: one(users, {
        fields: [invoices.userId],
        references: [users.id],
    }),
    service: one(services, {
        fields: [invoices.serviceId],
        references: [services.id],
    }),
    items: many(invoiceItems),
    configSelections: many(userConfigSelections),
}))

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
    invoice: one(invoices, {
        fields: [invoiceItems.invoiceId],
        references: [invoices.id],
    }),
}))

export const couponsRelations = relations(coupons, ({ one, many }) => ({
    user: one(users, {
        fields: [coupons.userId],
        references: [users.id],
    }),
    redemptions: many(couponRedemptions),
}))

export const couponRedemptionsRelations = relations(
    couponRedemptions,
    ({ one }) => ({
        coupon: one(coupons, {
            fields: [couponRedemptions.couponId],
            references: [coupons.id],
        }),
        user: one(users, {
            fields: [couponRedemptions.userId],
            references: [users.id],
        }),
        service: one(services, {
            fields: [couponRedemptions.serviceId],
            references: [services.id],
        }),
    })
)

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
    user: one(users, {
        fields: [tickets.userId],
        references: [users.id],
    }),
    assignedTo: one(users, {
        fields: [tickets.assignedToId],
        references: [users.id],
        relationName: 'assignedTickets',
    }),
    messages: many(ticketMessages),
}))

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
    ticket: one(tickets, {
        fields: [ticketMessages.ticketId],
        references: [tickets.id],
    }),
    author: one(users, {
        fields: [ticketMessages.authorId],
        references: [users.id],
    }),
}))

export const newsRelations = relations(news, ({ many }) => ({
    authors: many(newsAuthors),
    comments: many(newsComments),
    reactions: many(newsReactions),
    reads: many(newsRead),
}))

export const newsAuthorsRelations = relations(newsAuthors, ({ one }) => ({
    news: one(news, {
        fields: [newsAuthors.newsId],
        references: [news.id],
    }),
    user: one(users, {
        fields: [newsAuthors.userId],
        references: [users.id],
    }),
}))

export const newsCommentsRelations = relations(newsComments, ({ one }) => ({
    news: one(news, {
        fields: [newsComments.newsId],
        references: [news.id],
    }),
    author: one(users, {
        fields: [newsComments.authorId],
        references: [users.id],
    }),
}))

export const newsReactionsRelations = relations(newsReactions, ({ one }) => ({
    news: one(news, {
        fields: [newsReactions.newsId],
        references: [news.id],
    }),
    user: one(users, {
        fields: [newsReactions.userId],
        references: [users.id],
    }),
}))

export const newsReadRelations = relations(newsRead, ({ one }) => ({
    news: one(news, {
        fields: [newsRead.newsId],
        references: [news.id],
    }),
    user: one(users, {
        fields: [newsRead.userId],
        references: [users.id],
    }),
}))

export const configurableOptionsRelations = relations(
    configurableOptions,
    ({ one, many }) => ({
        scopes: many(configurableOptionScopes),
        pricing: one(configurableOptionPricing),
        userSelections: many(userConfigSelections),
    })
)

export const configurableOptionScopesRelations = relations(
    configurableOptionScopes,
    ({ one }) => ({
        option: one(configurableOptions, {
            fields: [configurableOptionScopes.optionId],
            references: [configurableOptions.id],
        }),
        product: one(products, {
            fields: [configurableOptionScopes.productId],
            references: [products.id],
        }),
    })
)

export const configurableOptionPricingRelations = relations(
    configurableOptionPricing,
    ({ one }) => ({
        option: one(configurableOptions, {
            fields: [configurableOptionPricing.optionId],
            references: [configurableOptions.id],
        }),
    })
)

export const userConfigSelectionsRelations = relations(
    userConfigSelections,
    ({ one }) => ({
        user: one(users, {
            fields: [userConfigSelections.userId],
            references: [users.id],
        }),
        option: one(configurableOptions, {
            fields: [userConfigSelections.optionId],
            references: [configurableOptions.id],
        }),
        invoice: one(invoices, {
            fields: [userConfigSelections.invoiceId],
            references: [invoices.id],
        }),
    })
)
