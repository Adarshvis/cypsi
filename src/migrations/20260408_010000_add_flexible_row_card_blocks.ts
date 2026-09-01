import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_flex_highlight_cards_cards" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_flex_highlight_cards" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_flex_feature_cards_cards_points" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_flex_feature_cards_cards" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_flex_feature_cards" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_flex_stats_cards_cards" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_flex_stats_cards" CASCADE;
  `)
}
