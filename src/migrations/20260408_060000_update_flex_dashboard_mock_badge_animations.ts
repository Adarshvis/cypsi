import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_flex_dashboard_mock"
    ADD COLUMN IF NOT EXISTS "top_badge_animation" varchar DEFAULT 'float',
    ADD COLUMN IF NOT EXISTS "bottom_badge_animation" varchar DEFAULT 'none';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_flex_dashboard_mock"
    DROP COLUMN IF EXISTS "top_badge_animation",
    DROP COLUMN IF EXISTS "bottom_badge_animation";
  `)
}
