import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_blocks_hero_layout"
    ADD VALUE IF NOT EXISTS 'fullscreenOverlayCarousel';

    ALTER TABLE "pages_blocks_hero"
    ADD COLUMN IF NOT EXISTS "text_vertical_position" varchar DEFAULT 'center';

    ALTER TABLE "pages_blocks_hero"
    ADD COLUMN IF NOT EXISTS "content_max_width" numeric DEFAULT 1200;

    ALTER TABLE "pages_blocks_hero"
    ADD COLUMN IF NOT EXISTS "content_padding_x" numeric DEFAULT 24;

    ALTER TABLE "pages_blocks_hero"
    ADD COLUMN IF NOT EXISTS "content_padding_y" numeric DEFAULT 32;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_hero"
    DROP COLUMN IF EXISTS "content_padding_y";

    ALTER TABLE "pages_blocks_hero"
    DROP COLUMN IF EXISTS "content_padding_x";

    ALTER TABLE "pages_blocks_hero"
    DROP COLUMN IF EXISTS "content_max_width";

    ALTER TABLE "pages_blocks_hero"
    DROP COLUMN IF EXISTS "text_vertical_position";
  `)
}
