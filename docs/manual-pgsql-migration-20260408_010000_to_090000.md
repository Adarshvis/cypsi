# Manual PostgreSQL Migration Script (20260408_010000 to 20260408_090000)

Use this when `pnpm migrate` cannot run on server.

## Important

- Run this on the same database your server uses.
- Take a backup before running.
- Execute in order.
- This script includes one data-fix step from `20260408_050000` (not pure DDL, but included for parity with repo migrations).

## SQL (UP)

```sql
BEGIN;

-- 20260408_010000_add_flexible_row_card_blocks
CREATE TABLE IF NOT EXISTS "pages_blocks_flex_stats_cards" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "_path" text NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "columns" varchar DEFAULT '4',
  "card_style" varchar DEFAULT 'outline',
  "block_name" varchar
);

CREATE TABLE IF NOT EXISTS "pages_blocks_flex_stats_cards_cards" (
  "_order" integer NOT NULL,
  "_parent_id" varchar NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "label" varchar,
  "value" varchar,
  "trend" varchar,
  "trend_label" varchar,
  "icon" varchar,
  "icon_color" varchar,
  "animation" varchar DEFAULT 'none'
);

CREATE TABLE IF NOT EXISTS "pages_blocks_flex_feature_cards" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "_path" text NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "columns" varchar DEFAULT '3',
  "card_style" varchar DEFAULT 'borderTop',
  "block_name" varchar
);

CREATE TABLE IF NOT EXISTS "pages_blocks_flex_feature_cards_cards" (
  "_order" integer NOT NULL,
  "_parent_id" varchar NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "icon" varchar,
  "icon_color" varchar,
  "accent_color" varchar,
  "title" varchar,
  "subtitle" varchar,
  "description" varchar,
  "animation" varchar DEFAULT 'none'
);

CREATE TABLE IF NOT EXISTS "pages_blocks_flex_feature_cards_cards_points" (
  "_order" integer NOT NULL,
  "_parent_id" varchar NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "text" varchar
);

CREATE TABLE IF NOT EXISTS "pages_blocks_flex_highlight_cards" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "_path" text NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "columns" varchar DEFAULT '2',
  "theme" varchar DEFAULT 'light',
  "block_name" varchar
);

CREATE TABLE IF NOT EXISTS "pages_blocks_flex_highlight_cards_cards" (
  "_order" integer NOT NULL,
  "_parent_id" varchar NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "icon" varchar,
  "icon_color" varchar,
  "title" varchar,
  "description" varchar,
  "animation" varchar DEFAULT 'none'
);

CREATE INDEX IF NOT EXISTS "pages_blocks_flex_stats_cards_order_idx" ON "pages_blocks_flex_stats_cards" ("_order");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_stats_cards_parent_id_idx" ON "pages_blocks_flex_stats_cards" ("_parent_id");

CREATE INDEX IF NOT EXISTS "pages_blocks_flex_stats_cards_cards_order_idx" ON "pages_blocks_flex_stats_cards_cards" ("_order");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_stats_cards_cards_parent_id_idx" ON "pages_blocks_flex_stats_cards_cards" ("_parent_id");

CREATE INDEX IF NOT EXISTS "pages_blocks_flex_feature_cards_order_idx" ON "pages_blocks_flex_feature_cards" ("_order");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_feature_cards_parent_id_idx" ON "pages_blocks_flex_feature_cards" ("_parent_id");

CREATE INDEX IF NOT EXISTS "pages_blocks_flex_feature_cards_cards_order_idx" ON "pages_blocks_flex_feature_cards_cards" ("_order");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_feature_cards_cards_parent_id_idx" ON "pages_blocks_flex_feature_cards_cards" ("_parent_id");

CREATE INDEX IF NOT EXISTS "pages_blocks_flex_feature_cards_cards_points_order_idx" ON "pages_blocks_flex_feature_cards_cards_points" ("_order");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_feature_cards_cards_points_parent_id_idx" ON "pages_blocks_flex_feature_cards_cards_points" ("_parent_id");

CREATE INDEX IF NOT EXISTS "pages_blocks_flex_highlight_cards_order_idx" ON "pages_blocks_flex_highlight_cards" ("_order");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_highlight_cards_parent_id_idx" ON "pages_blocks_flex_highlight_cards" ("_parent_id");

CREATE INDEX IF NOT EXISTS "pages_blocks_flex_highlight_cards_cards_order_idx" ON "pages_blocks_flex_highlight_cards_cards" ("_order");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_highlight_cards_cards_parent_id_idx" ON "pages_blocks_flex_highlight_cards_cards" ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "pages_blocks_flex_stats_cards"
  ADD CONSTRAINT "pages_blocks_flex_stats_cards_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "pages_blocks_flex_stats_cards_cards"
  ADD CONSTRAINT "pages_blocks_flex_stats_cards_cards_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_flex_stats_cards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "pages_blocks_flex_feature_cards"
  ADD CONSTRAINT "pages_blocks_flex_feature_cards_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "pages_blocks_flex_feature_cards_cards"
  ADD CONSTRAINT "pages_blocks_flex_feature_cards_cards_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_flex_feature_cards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "pages_blocks_flex_feature_cards_cards_points"
  ADD CONSTRAINT "pages_blocks_flex_feature_cards_cards_points_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_flex_feature_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "pages_blocks_flex_highlight_cards"
  ADD CONSTRAINT "pages_blocks_flex_highlight_cards_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "pages_blocks_flex_highlight_cards_cards"
  ADD CONSTRAINT "pages_blocks_flex_highlight_cards_cards_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_flex_highlight_cards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 20260408_020000_add_flex_buttons_subblock
CREATE TABLE IF NOT EXISTS "pages_blocks_flex_buttons" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "_path" text NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "alignment" varchar DEFAULT 'left',
  "block_name" varchar
);

CREATE TABLE IF NOT EXISTS "pages_blocks_flex_buttons_buttons" (
  "_order" integer NOT NULL,
  "_parent_id" varchar NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "label" varchar,
  "url" varchar,
  "variant" varchar DEFAULT 'primary',
  "size" varchar DEFAULT 'md',
  "icon" varchar,
  "open_in_new_tab" boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS "pages_blocks_flex_buttons_order_idx" ON "pages_blocks_flex_buttons" ("_order");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_buttons_parent_id_idx" ON "pages_blocks_flex_buttons" ("_parent_id");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_buttons_buttons_order_idx" ON "pages_blocks_flex_buttons_buttons" ("_order");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_buttons_buttons_parent_id_idx" ON "pages_blocks_flex_buttons_buttons" ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "pages_blocks_flex_buttons"
  ADD CONSTRAINT "pages_blocks_flex_buttons_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "pages_blocks_flex_buttons_buttons"
  ADD CONSTRAINT "pages_blocks_flex_buttons_buttons_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_flex_buttons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 20260408_030000_add_flex_dashboard_mock_subblock
CREATE TABLE IF NOT EXISTS "pages_blocks_flex_dashboard_mock" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "_path" text NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "theme" varchar DEFAULT 'light',
  "chart_count" numeric DEFAULT 3,
  "top_badge_label" varchar DEFAULT 'ACTIVE SCHOOLS',
  "top_badge_value" varchar DEFAULT '1,500+',
  "bottom_chip_primary" varchar DEFAULT 'Goa Live',
  "bottom_chip_secondary" varchar DEFAULT 'National Rollout',
  "bottom_summary" varchar DEFAULT 'Centralized data across schools of India.',
  "block_name" varchar
);

CREATE INDEX IF NOT EXISTS "pages_blocks_flex_dashboard_mock_order_idx" ON "pages_blocks_flex_dashboard_mock" ("_order");
CREATE INDEX IF NOT EXISTS "pages_blocks_flex_dashboard_mock_parent_id_idx" ON "pages_blocks_flex_dashboard_mock" ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "pages_blocks_flex_dashboard_mock"
  ADD CONSTRAINT "pages_blocks_flex_dashboard_mock_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 20260408_040000_update_flex_dashboard_mock_typography
ALTER TABLE "pages_blocks_flex_dashboard_mock"
ADD COLUMN IF NOT EXISTS "top_badge_label_size" varchar DEFAULT 'md',
ADD COLUMN IF NOT EXISTS "top_badge_label_color" varchar DEFAULT '#64748b',
ADD COLUMN IF NOT EXISTS "top_badge_value_size" varchar DEFAULT '2xl',
ADD COLUMN IF NOT EXISTS "top_badge_value_color" varchar DEFAULT '#4338ca',
ADD COLUMN IF NOT EXISTS "bottom_summary_size" varchar DEFAULT 'lg',
ADD COLUMN IF NOT EXISTS "bottom_summary_color" varchar DEFAULT '#334155';

-- 20260408_050000_cleanup_invalid_page_relationships (data fix)
UPDATE "pages"
SET "parent_id" = NULL
WHERE "parent_id" IS NOT NULL
  AND "parent_id" NOT IN (SELECT "id" FROM "pages");

DELETE FROM "header_nav_items_children"
WHERE "page_id" IS NOT NULL
  AND "page_id" NOT IN (SELECT "id" FROM "pages");

-- 20260408_060000_update_flex_dashboard_mock_badge_animations
ALTER TABLE "pages_blocks_flex_dashboard_mock"
ADD COLUMN IF NOT EXISTS "top_badge_animation" varchar DEFAULT 'float',
ADD COLUMN IF NOT EXISTS "bottom_badge_animation" varchar DEFAULT 'none';

-- 20260408_070000_convert_flex_feature_cards_text_to_richtext
ALTER TABLE "pages_blocks_flex_feature_cards_cards"
ALTER COLUMN "title" TYPE jsonb
USING (
  CASE
    WHEN "title" IS NULL OR btrim("title") = '' THEN NULL
    ELSE jsonb_build_object(
      'root',
      jsonb_build_object(
        'type', 'root',
        'children', jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'version', 1,
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'text',
                'version', 1,
                'text', "title",
                'detail', 0,
                'format', 0,
                'mode', 'normal',
                'style', ''
              )
            ),
            'direction', 'ltr',
            'format', '',
            'indent', 0,
            'textFormat', 0,
            'textStyle', ''
          )
        ),
        'direction', 'ltr',
        'format', '',
        'indent', 0,
        'version', 1
      )
    )
  END
);

ALTER TABLE "pages_blocks_flex_feature_cards_cards"
ALTER COLUMN "description" TYPE jsonb
USING (
  CASE
    WHEN "description" IS NULL OR btrim("description") = '' THEN NULL
    ELSE jsonb_build_object(
      'root',
      jsonb_build_object(
        'type', 'root',
        'children', jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'version', 1,
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'text',
                'version', 1,
                'text', "description",
                'detail', 0,
                'format', 0,
                'mode', 'normal',
                'style', ''
              )
            ),
            'direction', 'ltr',
            'format', '',
            'indent', 0,
            'textFormat', 0,
            'textStyle', ''
          )
        ),
        'direction', 'ltr',
        'format', '',
        'indent', 0,
        'version', 1
      )
    )
  END
);

-- 20260408_080000_add_highlight_cards_style_controls
ALTER TABLE "pages_blocks_flex_highlight_cards"
ADD COLUMN IF NOT EXISTS "title_size" varchar DEFAULT 'base';

ALTER TABLE "pages_blocks_flex_highlight_cards"
ADD COLUMN IF NOT EXISTS "icon_bg_color" varchar DEFAULT '#EEF2FF';

ALTER TABLE "pages_blocks_flex_highlight_cards"
ADD COLUMN IF NOT EXISTS "icon_alignment" varchar DEFAULT 'left';

-- 20260408_090000_add_dashboard_mock_layout_variant
ALTER TABLE "pages_blocks_flex_dashboard_mock"
ADD COLUMN IF NOT EXISTS "layout_variant" varchar DEFAULT 'floatingCards';

ALTER TABLE "pages_blocks_flex_dashboard_mock"
ADD COLUMN IF NOT EXISTS "sync_footer_text" varchar DEFAULT 'SYNCING WITH UDISE+ CLOUD';

COMMIT;
```

## Quick verification SQL

```sql
-- confirm tables exist
SELECT to_regclass('public.pages_blocks_flex_feature_cards') AS flex_feature_cards;
SELECT to_regclass('public.pages_blocks_flex_dashboard_mock') AS flex_dashboard_mock;

-- confirm rich text columns are jsonb
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'pages_blocks_flex_feature_cards_cards'
  AND column_name IN ('title', 'description')
ORDER BY column_name;

-- confirm newer dashboard columns
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'pages_blocks_flex_dashboard_mock'
  AND column_name IN ('layout_variant', 'sync_footer_text', 'top_badge_animation', 'bottom_badge_animation')
ORDER BY column_name;
```

## Why admin showed blocks but frontend did not show data

Most common reasons in this project:

1. Wrong table altered
   - Example you gave updates `pages_blocks_feature_cards`, but your new work is in `flex*` tables such as `pages_blocks_flex_feature_cards` and `pages_blocks_flex_feature_cards_cards`.

2. Partial manual migration
   - If parent table exists but nested child tables/columns are missing, admin UI can render config but saved data may not persist correctly for frontend queries.

3. Rich text type mismatch
   - After converting to rich text in code, columns must be `jsonb` (with lexical JSON shape). Keeping them as `varchar` can break rendering expectations.

4. Environment mismatch
   - Data entered on server DB will not appear locally if local frontend points to a different local DB in environment variables.

5. Server not restarted after schema/code change
   - Payload/Next caches can keep stale behavior until app restart.

## Recommended manual workflow on server

1. Backup DB.
2. Run SQL above in one transaction.
3. Restart app process.
4. Create/update one test page block in admin.
5. Verify records exist in the corresponding `pages_blocks_flex_*` tables.
6. Verify frontend is connected to the same DB used by admin.
