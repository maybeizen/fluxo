-- Ensure pterodactyl plugin row exists for backfilled product integrations
INSERT INTO "plugins" ("id", "name", "version", "enabled", "config")
VALUES ('pterodactyl', 'Pterodactyl', '1.0.0', true, '{}'::jsonb)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
-- Backfill legacy product_integrations into plugin config before dropping columns
UPDATE "product_integrations"
SET
    "service_plugin_id" = 'pterodactyl',
    "service_plugin_config" = jsonb_strip_nulls(
        jsonb_build_object(
            'locationId', "location_id",
            'nodeId', "node_id",
            'nestId', "nest_id",
            'eggId', "egg_id",
            'memory', "memory",
            'swap', "swap",
            'disk', "disk",
            'io', "io",
            'cpu', "cpu",
            'cpuPinning', "cpu_pinning",
            'databases', "databases",
            'backups', "backups",
            'additionalAllocations', "additional_allocations",
            'oomKiller', "oom_killer",
            'skipEggInstallScript', "skip_egg_install_script",
            'startOnCompletion', "start_on_completion"
        )
    )
WHERE "enabled" = true
    AND "service_plugin_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "enabled";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "location_id";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "node_id";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "nest_id";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "egg_id";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "memory";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "swap";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "disk";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "io";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "cpu";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "cpu_pinning";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "databases";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "backups";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "additional_allocations";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "oom_killer";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "skip_egg_install_script";
--> statement-breakpoint
ALTER TABLE "product_integrations" DROP COLUMN "start_on_completion";
--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "gateways";
--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "pterodactyl_base_url";
--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "pterodactyl_api_key";
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "tickets_enabled" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "maintenance_mode" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "maintenance_message" text;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "debug_mode" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "announcement_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "announcement_message" text;
