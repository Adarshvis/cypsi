import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_flex_dashboard_mock"
    ADD COLUMN IF NOT EXISTS "layout_variant" varchar DEFAULT 'floatingCards';

    ALTER TABLE "pages_blocks_flex_dashboard_mock"
    ADD COLUMN IF NOT EXISTS "sync_footer_text" varchar DEFAULT 'SYNCING WITH UDISE+ CLOUD';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_flex_dashboard_mock"
    DROP COLUMN IF EXISTS "sync_footer_text";

    ALTER TABLE "pages_blocks_flex_dashboard_mock"
    DROP COLUMN IF EXISTS "layout_variant";
  `)
}
