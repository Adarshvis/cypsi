import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_goa_snapshot_summary_cards_cards_value_source" AS ENUM(
        'totalSchools',
        'districtCount',
        'talukaCount',
        'currentViewItems',
        'minoritySchools',
        'girlsOnlySchools',
        'boysOnlySchools',
        'englishMedium',
        'konkaniMedium',
        'marathiMedium',
        'custom'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TABLE "pages_blocks_goa_snapshot"
      ADD COLUMN IF NOT EXISTS "summary_cards_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "summary_cards_animate_scroll" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "summary_cards_scroll_duration_seconds" numeric DEFAULT 22;

    CREATE TABLE IF NOT EXISTS "pages_blocks_goa_snapshot_summary_cards_cards" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "is_enabled" boolean DEFAULT true,
      "label" varchar NOT NULL,
      "icon_name" varchar DEFAULT 'School',
      "value_source" "enum_pages_blocks_goa_snapshot_summary_cards_cards_value_source" DEFAULT 'custom' NOT NULL,
      "custom_value" numeric DEFAULT 0,
      CONSTRAINT "pages_blocks_goa_snapshot_summary_cards_cards_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_goa_snapshot"("id")
        ON DELETE cascade ON UPDATE no action
    );

    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_summary_cards_cards_order_idx"
      ON "pages_blocks_goa_snapshot_summary_cards_cards" USING btree ("_order");

    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_summary_cards_cards_parent_id_idx"
      ON "pages_blocks_goa_snapshot_summary_cards_cards" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_goa_snapshot_summary_cards_cards";

    ALTER TABLE "pages_blocks_goa_snapshot"
      DROP COLUMN IF EXISTS "summary_cards_enabled",
      DROP COLUMN IF EXISTS "summary_cards_animate_scroll",
      DROP COLUMN IF EXISTS "summary_cards_scroll_duration_seconds";

    DROP TYPE IF EXISTS "public"."enum_pages_blocks_goa_snapshot_summary_cards_cards_value_source";
  `)
}
