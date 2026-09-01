import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_goa_snapshot"
      ADD COLUMN IF NOT EXISTS "filter_settings_show_apply_button" boolean DEFAULT true;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_goa_snapshot"
      DROP COLUMN IF EXISTS "filter_settings_show_apply_button";
  `)
}
