ALTER TABLE "users" ADD COLUMN "avatar_key" varchar(300);--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "app_logo_key" varchar(300);--> statement-breakpoint
UPDATE "users"
SET "avatar_key" = regexp_replace(
    regexp_replace(
        substring("avatar_url" from '/storage/([^?#]+)'),
        '\.(png|jpe?g|webp|svg)$',
        '',
        'i'
    ),
    '-(64|256|full)$',
    '',
    'i'
)
WHERE "avatar_url" IS NOT NULL
  AND "avatar_url" LIKE '%/storage/%';--> statement-breakpoint
UPDATE "settings"
SET "app_logo_key" = regexp_replace(
    regexp_replace(
        substring("app_logo_url" from '/storage/([^?#]+)'),
        '\.(png|jpe?g|webp|svg)$',
        '',
        'i'
    ),
    '-(64|256|full)$',
    '',
    'i'
)
WHERE "app_logo_url" IS NOT NULL
  AND "app_logo_url" LIKE '%/storage/%';
