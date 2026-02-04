CREATE TABLE "plugin_migrations" (
	"id" varchar(64) NOT NULL,
	"migration_name" varchar(255) NOT NULL,
	"executed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plugins" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"version" varchar(32) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"config" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_integrations" ADD COLUMN "service_plugin_id" varchar(64);--> statement-breakpoint
ALTER TABLE "product_integrations" ADD COLUMN "service_plugin_config" jsonb;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "gateway_plugin_id" varchar(64);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_provider_key" varchar(64);--> statement-breakpoint
CREATE INDEX "plugin_migrations_plugin_id_idx" ON "plugin_migrations" USING btree ("id");--> statement-breakpoint
CREATE INDEX "plugin_migrations_unique_idx" ON "plugin_migrations" USING btree ("id","migration_name");--> statement-breakpoint
CREATE INDEX "plugins_enabled_idx" ON "plugins" USING btree ("enabled");