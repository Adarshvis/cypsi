import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_hero"
      ADD COLUMN IF NOT EXISTS "header_glass_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "header_glass_fill_color" varchar DEFAULT '#FFFFFF',
      ADD COLUMN IF NOT EXISTS "header_glass_fill_opacity" numeric DEFAULT 20,
      ADD COLUMN IF NOT EXISTS "header_glass_blur_amount" numeric DEFAULT 16,
      ADD COLUMN IF NOT EXISTS "header_glass_show_divider" boolean DEFAULT true;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_hero"
      DROP COLUMN IF EXISTS "header_glass_enabled",
      DROP COLUMN IF EXISTS "header_glass_fill_color",
      DROP COLUMN IF EXISTS "header_glass_fill_opacity",
      DROP COLUMN IF EXISTS "header_glass_blur_amount",
      DROP COLUMN IF EXISTS "header_glass_show_divider";
  `)
}
