import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'enum_pages_blocks_hero_constant_overlay_buttons_variant'
          AND n.nspname = 'public'
      ) THEN
        CREATE TYPE "public"."enum_pages_blocks_hero_constant_overlay_buttons_variant"
          AS ENUM ('primary', 'secondary', 'outline');
      END IF;
    END $$;

    ALTER TABLE "pages_blocks_hero"
      ADD COLUMN IF NOT EXISTS "constant_overlay_show_text" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "constant_overlay_heading" varchar,
      ADD COLUMN IF NOT EXISTS "constant_overlay_heading_color" varchar DEFAULT '#FFFFFF',
      ADD COLUMN IF NOT EXISTS "constant_overlay_subtitle" varchar,
      ADD COLUMN IF NOT EXISTS "constant_overlay_subtitle_color" varchar DEFAULT '#E5E7EB';

    CREATE TABLE IF NOT EXISTS "pages_blocks_hero_constant_overlay_buttons" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "url" varchar,
      "variant" "enum_pages_blocks_hero_constant_overlay_buttons_variant" DEFAULT 'primary',
      "icon" varchar
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'pages_blocks_hero_constant_overlay_buttons_parent_id_fk'
      ) THEN
        ALTER TABLE "pages_blocks_hero_constant_overlay_buttons"
          ADD CONSTRAINT "pages_blocks_hero_constant_overlay_buttons_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "pages_blocks_hero_constant_overlay_buttons_order_idx"
      ON "pages_blocks_hero_constant_overlay_buttons" USING btree ("_order");

    CREATE INDEX IF NOT EXISTS "pages_blocks_hero_constant_overlay_buttons_parent_id_idx"
      ON "pages_blocks_hero_constant_overlay_buttons" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_hero_constant_overlay_buttons" CASCADE;

    ALTER TABLE IF EXISTS "pages_blocks_hero"
      DROP COLUMN IF EXISTS "constant_overlay_show_text",
      DROP COLUMN IF EXISTS "constant_overlay_heading",
      DROP COLUMN IF EXISTS "constant_overlay_heading_color",
      DROP COLUMN IF EXISTS "constant_overlay_subtitle",
      DROP COLUMN IF EXISTS "constant_overlay_subtitle_color";

    DROP TYPE IF EXISTS "public"."enum_pages_blocks_hero_constant_overlay_buttons_variant";`)
}
