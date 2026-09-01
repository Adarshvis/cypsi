import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_flex_dashboard_mock" CASCADE;
  `)
}
