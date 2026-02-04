CREATE TYPE "public"."app_environment" AS ENUM('development', 'production');--> statement-breakpoint
CREATE TYPE "public"."coupon_duration_type" AS ENUM('once', 'repeating', 'forever');--> statement-breakpoint
CREATE TYPE "public"."coupon_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('pending', 'paid', 'expired');--> statement-breakpoint
CREATE TYPE "public"."news_reaction_type" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TYPE "public"."news_visibility" AS ENUM('public', 'private', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('stripe', 'account_balance');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('active', 'suspended', 'cancelled', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'closed', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."ticket_type" AS ENUM('general', 'account', 'billing', 'legal', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'staff', 'user', 'client');--> statement-breakpoint
CREATE TABLE "user_discord" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"discord_id" varchar(255),
	"discord_username" varchar(255),
	"discord_avatar_hash" varchar(255),
	"discord_access_token" text,
	"discord_refresh_token" text,
	"discord_token_expires_at" timestamp,
	CONSTRAINT "user_discord_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_email_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "user_email_verification_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_password_reset" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "user_password_reset_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(255) DEFAULT '' NOT NULL,
	"last_name" varchar(255) DEFAULT '' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"pterodactyl_id" varchar(255),
	"username" varchar(255) NOT NULL,
	"slug" varchar(255),
	"headline" text,
	"about" text,
	"avatar_url" varchar(500),
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_ticket_banned" boolean DEFAULT false NOT NULL,
	"punishment_reference_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"location_id" integer,
	"node_id" integer,
	"nest_id" integer,
	"egg_id" integer,
	"memory" integer,
	"swap" integer,
	"disk" integer,
	"io" integer,
	"cpu" integer,
	"cpu_pinning" varchar(255),
	"databases" integer,
	"backups" integer,
	"additional_allocations" integer,
	"oom_killer" boolean DEFAULT false,
	"skip_egg_install_script" boolean DEFAULT false,
	"start_on_completion" boolean DEFAULT true,
	CONSTRAINT "product_integrations_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" double precision NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cpu" integer NOT NULL,
	"ram" integer NOT NULL,
	"storage" integer NOT NULL,
	"ports" integer NOT NULL,
	"databases" integer NOT NULL,
	"backups" integer NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"allow_coupons" boolean DEFAULT true NOT NULL,
	"stock_enabled" boolean DEFAULT false NOT NULL,
	"stock" integer,
	"category_id" integer,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"service_owner_id" integer NOT NULL,
	"service_name" varchar(255) NOT NULL,
	"external_id" varchar(255) DEFAULT '',
	"status" "service_status" NOT NULL,
	"monthly_price" double precision NOT NULL,
	"due_date" timestamp NOT NULL,
	"creation_error" boolean DEFAULT false NOT NULL,
	"location" varchar(255) NOT NULL,
	"dedicated_ip" boolean DEFAULT false NOT NULL,
	"proxy_addon" boolean DEFAULT false NOT NULL,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"cancellation_reason" text,
	"cancellation_date" timestamp,
	"is_suspended" boolean DEFAULT false NOT NULL,
	"suspension_reason" text,
	"suspension_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" double precision NOT NULL,
	"total" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"service_id" integer,
	"transaction_id" varchar(255),
	"status" "invoice_status" DEFAULT 'pending' NOT NULL,
	"amount" double precision NOT NULL,
	"currency" varchar(10) DEFAULT 'usd' NOT NULL,
	"payment_provider" "payment_provider",
	"coupon_code" varchar(255),
	"coupon_type" "coupon_type",
	"coupon_value" double precision,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"expired_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"coupon_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"service_id" integer,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"code" varchar(255) NOT NULL,
	"type" "coupon_type" NOT NULL,
	"value" double precision NOT NULL,
	"duration_type" "coupon_duration_type" NOT NULL,
	"duration_count" integer,
	"max_redemptions" integer,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"assigned_to_id" integer,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"type" "ticket_type" DEFAULT 'general' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"responded_to_at" timestamp,
	"closed_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"summary" text NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visibility" "news_visibility" DEFAULT 'draft' NOT NULL,
	"slug" varchar(255) NOT NULL,
	"featured_image_url" varchar(500),
	"seo_title" varchar(255),
	"seo_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "news_authors_news_id_user_id_unique" UNIQUE("news_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "news_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"reaction_type" "news_reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_reactions_news_id_user_id_unique" UNIQUE("news_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "news_read" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_read_news_id_user_id_unique" UNIQUE("news_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"app_name" varchar(255),
	"app_base_url" varchar(500),
	"app_environment" "app_environment",
	"app_theme_color" varchar(50),
	"app_logo_url" varchar(500),
	"auth_disable_email_verification" boolean DEFAULT false,
	"auth_disable_registration" boolean DEFAULT false,
	"auth_disable_login" boolean DEFAULT false,
	"auth_disable_password_change" boolean DEFAULT false,
	"discord_client_id" varchar(255),
	"discord_client_secret" text,
	"discord_redirect_uri" varchar(500),
	"email_smtp_host" varchar(255),
	"email_smtp_port" integer,
	"email_smtp_user" varchar(255),
	"email_smtp_pass" text,
	"email_from" varchar(255),
	"gateways" jsonb,
	"security" jsonb,
	"pterodactyl_base_url" varchar(500),
	"pterodactyl_api_key" text
);
--> statement-breakpoint
ALTER TABLE "user_discord" ADD CONSTRAINT "user_discord_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_email_verification" ADD CONSTRAINT "user_email_verification_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_password_reset" ADD CONSTRAINT "user_password_reset_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_integrations" ADD CONSTRAINT "product_integrations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_service_owner_id_users_id_fk" FOREIGN KEY ("service_owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_authors" ADD CONSTRAINT "news_authors_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_authors" ADD CONSTRAINT "news_authors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_comments" ADD CONSTRAINT "news_comments_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_comments" ADD CONSTRAINT "news_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_reactions" ADD CONSTRAINT "news_reactions_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_reactions" ADD CONSTRAINT "news_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_read" ADD CONSTRAINT "news_read_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_read" ADD CONSTRAINT "news_read_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_slug_idx" ON "users" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "products_hidden_idx" ON "products" USING btree ("hidden");--> statement-breakpoint
CREATE INDEX "products_disabled_idx" ON "products" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_order_idx" ON "products" USING btree ("order");--> statement-breakpoint
CREATE INDEX "services_service_owner_idx" ON "services" USING btree ("service_owner_id");--> statement-breakpoint
CREATE INDEX "services_product_idx" ON "services" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "services_status_idx" ON "services" USING btree ("status");--> statement-breakpoint
CREATE INDEX "services_due_date_idx" ON "services" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "invoices_user_id_idx" ON "invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invoices_service_id_idx" ON "invoices" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_expires_at_idx" ON "invoices" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "invoices_transaction_id_idx" ON "invoices" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_coupon_id_idx" ON "coupon_redemptions" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_user_id_idx" ON "coupon_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_service_id_idx" ON "coupon_redemptions" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_user_id_idx" ON "coupons" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coupons_deleted_at_idx" ON "coupons" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ticket_messages_ticket_id_idx" ON "ticket_messages" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_messages_author_id_idx" ON "ticket_messages" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "ticket_messages_created_at_idx" ON "ticket_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tickets_user_id_idx" ON "tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tickets_assigned_to_idx" ON "tickets" USING btree ("assigned_to_id");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tickets_type_idx" ON "tickets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tickets_created_at_idx" ON "tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "news_slug_idx" ON "news" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "news_visibility_idx" ON "news" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "news_is_featured_idx" ON "news" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "news_published_at_idx" ON "news" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");