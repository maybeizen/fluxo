-- Phase 2: indexes, money-as-cents, constraints

-- Money columns: convert double precision to integer cents
ALTER TABLE "products" ALTER COLUMN "price" TYPE integer USING ROUND("price")::integer;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "monthly_price" TYPE integer USING ROUND("monthly_price")::integer;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "amount" TYPE integer USING ROUND("amount")::integer;--> statement-breakpoint
ALTER TABLE "invoice_items" ALTER COLUMN "unit_price" TYPE integer USING ROUND("unit_price")::integer;--> statement-breakpoint
ALTER TABLE "invoice_items" ALTER COLUMN "total" TYPE integer USING ROUND("total")::integer;--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "value" TYPE integer USING ROUND("value")::integer;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "coupon_value" TYPE integer USING ROUND("coupon_value")::integer;--> statement-breakpoint

-- invoices.metadata text -> jsonb
ALTER TABLE "invoices" ALTER COLUMN "metadata" TYPE jsonb USING CASE WHEN "metadata" IS NULL OR "metadata" = '' THEN NULL ELSE "metadata"::jsonb END;--> statement-breakpoint

-- use_value_as_multiplier int -> boolean
ALTER TABLE "configurable_option_pricing" ALTER COLUMN "use_value_as_multiplier" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "configurable_option_pricing" ALTER COLUMN "use_value_as_multiplier" TYPE boolean USING ("use_value_as_multiplier" != 0);--> statement-breakpoint
ALTER TABLE "configurable_option_pricing" ALTER COLUMN "use_value_as_multiplier" SET DEFAULT false;--> statement-breakpoint

-- Indexes
CREATE INDEX IF NOT EXISTS "invoice_items_invoice_id_idx" ON "invoice_items" ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_password_reset_token_idx" ON "user_password_reset" ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_verification_token_idx" ON "user_email_verification" ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "news_comments_news_author_idx" ON "news_comments" ("news_id", "author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_user_status_idx" ON "invoices" ("user_id", "status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_gateway_plugin_id_idx" ON "invoices" ("gateway_plugin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tickets_deleted_at_idx" ON "tickets" ("deleted_at") WHERE "deleted_at" IS NOT NULL;--> statement-breakpoint

-- Drop redundant indexes that duplicate UNIQUE constraints
DROP INDEX IF EXISTS "users_email_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "users_username_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "coupons_code_idx";--> statement-breakpoint

-- Ensure plugin rows exist for any referenced IDs before adding FKs
INSERT INTO "plugins" ("id", "name", "version", "enabled")
SELECT DISTINCT ref.id, ref.id, '0.0.0', true
FROM (
	SELECT "service_plugin_id" AS id FROM "product_integrations" WHERE "service_plugin_id" IS NOT NULL
	UNION
	SELECT "gateway_plugin_id" AS id FROM "invoices" WHERE "gateway_plugin_id" IS NOT NULL
	UNION
	SELECT "plugin_id" AS id FROM "configurable_options" WHERE "plugin_id" IS NOT NULL
) ref
WHERE ref.id IS NOT NULL
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint

-- Foreign keys to plugins
ALTER TABLE "product_integrations" ADD CONSTRAINT "product_integrations_service_plugin_id_plugins_id_fk" FOREIGN KEY ("service_plugin_id") REFERENCES "plugins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_gateway_plugin_id_plugins_id_fk" FOREIGN KEY ("gateway_plugin_id") REFERENCES "plugins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configurable_options" ADD CONSTRAINT "configurable_options_plugin_id_plugins_id_fk" FOREIGN KEY ("plugin_id") REFERENCES "plugins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

-- plugin_migrations unique constraint
DROP INDEX IF EXISTS "plugin_migrations_unique_idx";--> statement-breakpoint
ALTER TABLE "plugin_migrations" ADD CONSTRAINT "plugin_migrations_plugin_migration_unique" UNIQUE("id", "migration_name");
