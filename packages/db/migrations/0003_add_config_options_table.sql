CREATE TYPE "public"."configurable_option_pricing_type" AS ENUM('one_time', 'recurring', 'billing_cycle');--> statement-breakpoint
CREATE TABLE "configurable_option_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"option_id" integer NOT NULL,
	"pricing_type" "configurable_option_pricing_type" NOT NULL,
	"amount" integer NOT NULL,
	"use_value_as_multiplier" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "configurable_option_pricing_option_id_unique" UNIQUE("option_id")
);
--> statement-breakpoint
CREATE TABLE "configurable_option_scopes" (
	"id" serial PRIMARY KEY NOT NULL,
	"option_id" integer NOT NULL,
	"product_id" integer,
	"default_value" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "configurable_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"plugin_id" varchar(64) NOT NULL,
	"field_key" varchar(255) NOT NULL,
	"label" varchar(255),
	"default_value" jsonb,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_config_selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"value" jsonb NOT NULL,
	"invoice_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "configurable_option_pricing" ADD CONSTRAINT "configurable_option_pricing_option_id_configurable_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."configurable_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configurable_option_scopes" ADD CONSTRAINT "configurable_option_scopes_option_id_configurable_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."configurable_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configurable_option_scopes" ADD CONSTRAINT "configurable_option_scopes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_config_selections" ADD CONSTRAINT "user_config_selections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_config_selections" ADD CONSTRAINT "user_config_selections_option_id_configurable_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."configurable_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_config_selections" ADD CONSTRAINT "user_config_selections_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "configurable_option_pricing_option_id_idx" ON "configurable_option_pricing" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "configurable_option_scopes_option_id_idx" ON "configurable_option_scopes" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "configurable_option_scopes_product_id_idx" ON "configurable_option_scopes" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "configurable_option_scopes_option_product_unique" ON "configurable_option_scopes" USING btree ("option_id","product_id");--> statement-breakpoint
CREATE INDEX "configurable_options_plugin_id_idx" ON "configurable_options" USING btree ("plugin_id");--> statement-breakpoint
CREATE INDEX "configurable_options_field_key_idx" ON "configurable_options" USING btree ("field_key");--> statement-breakpoint
CREATE INDEX "user_config_selections_user_option_idx" ON "user_config_selections" USING btree ("user_id","option_id");--> statement-breakpoint
CREATE INDEX "user_config_selections_invoice_id_idx" ON "user_config_selections" USING btree ("invoice_id");