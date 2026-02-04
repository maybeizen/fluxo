import { pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', [
    'admin',
    'staff',
    'user',
    'client',
])

export const serviceStatusEnum = pgEnum('service_status', [
    'active',
    'suspended',
    'cancelled',
    'deleted',
])

export const invoiceStatusEnum = pgEnum('invoice_status', [
    'pending',
    'paid',
    'expired',
])

export const paymentProviderEnum = pgEnum('payment_provider', [
    'stripe',
    'account_balance',
])

export const couponTypeEnum = pgEnum('coupon_type', ['percentage', 'fixed'])

export const couponDurationTypeEnum = pgEnum('coupon_duration_type', [
    'once',
    'repeating',
    'forever',
])

export const ticketStatusEnum = pgEnum('ticket_status', [
    'open',
    'closed',
    'deleted',
])

export const ticketTypeEnum = pgEnum('ticket_type', [
    'general',
    'account',
    'billing',
    'legal',
    'other',
])

export const newsVisibilityEnum = pgEnum('news_visibility', [
    'public',
    'private',
    'draft',
    'archived',
])

export const newsReactionTypeEnum = pgEnum('news_reaction_type', [
    'like',
    'dislike',
])

export const appEnvironmentEnum = pgEnum('app_environment', [
    'development',
    'production',
])
