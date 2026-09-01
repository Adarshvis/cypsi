import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_hero"
      ADD COLUMN IF NOT EXISTS "single_slide_heading_color" varchar DEFAULT '#FFFFFF',
      ADD COLUMN IF NOT EXISTS "single_slide_subtitle_color" varchar DEFAULT '#E5E7EB';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_hero"
      DROP COLUMN IF EXISTS "single_slide_heading_color",
      DROP COLUMN IF EXISTS "single_slide_subtitle_color";
  `)
}
