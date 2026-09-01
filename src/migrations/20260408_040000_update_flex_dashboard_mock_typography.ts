import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_flex_dashboard_mock"
    ADD COLUMN IF NOT EXISTS "top_badge_label_size" varchar DEFAULT 'md',
    ADD COLUMN IF NOT EXISTS "top_badge_label_color" varchar DEFAULT '#64748b',
    ADD COLUMN IF NOT EXISTS "top_badge_value_size" varchar DEFAULT '2xl',
    ADD COLUMN IF NOT EXISTS "top_badge_value_color" varchar DEFAULT '#4338ca',
    ADD COLUMN IF NOT EXISTS "bottom_summary_size" varchar DEFAULT 'lg',
    ADD COLUMN IF NOT EXISTS "bottom_summary_color" varchar DEFAULT '#334155';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_flex_dashboard_mock"
    DROP COLUMN IF EXISTS "top_badge_label_size",
    DROP COLUMN IF EXISTS "top_badge_label_color",
    DROP COLUMN IF EXISTS "top_badge_value_size",
    DROP COLUMN IF EXISTS "top_badge_value_color",
    DROP COLUMN IF EXISTS "bottom_summary_size",
    DROP COLUMN IF EXISTS "bottom_summary_color";
  `)
}
