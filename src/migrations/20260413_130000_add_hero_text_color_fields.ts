import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "pages_blocks_hero"
      ADD COLUMN IF NOT EXISTS "single_slide_heading_color" varchar DEFAULT '#FFFFFF',
      ADD COLUMN IF NOT EXISTS "single_slide_subtitle_color" varchar DEFAULT '#E5E7EB';

    ALTER TABLE IF EXISTS "pages_blocks_hero_slides"
      ADD COLUMN IF NOT EXISTS "heading_color" varchar DEFAULT '#FFFFFF',
      ADD COLUMN IF NOT EXISTS "subtitle_color" varchar DEFAULT '#E5E7EB';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "pages_blocks_hero_slides"
      DROP COLUMN IF EXISTS "heading_color",
      DROP COLUMN IF EXISTS "subtitle_color";

    ALTER TABLE IF EXISTS "pages_blocks_hero"
      DROP COLUMN IF EXISTS "single_slide_heading_color",
      DROP COLUMN IF EXISTS "single_slide_subtitle_color";
  `)
}
