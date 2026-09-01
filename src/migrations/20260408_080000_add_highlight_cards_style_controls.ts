import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_flex_highlight_cards"
    ADD COLUMN IF NOT EXISTS "title_size" varchar DEFAULT 'base';

    ALTER TABLE "pages_blocks_flex_highlight_cards"
    ADD COLUMN IF NOT EXISTS "icon_bg_color" varchar DEFAULT '#EEF2FF';

    ALTER TABLE "pages_blocks_flex_highlight_cards"
    ADD COLUMN IF NOT EXISTS "icon_alignment" varchar DEFAULT 'left';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_flex_highlight_cards"
    DROP COLUMN IF EXISTS "icon_alignment";

    ALTER TABLE "pages_blocks_flex_highlight_cards"
    DROP COLUMN IF EXISTS "icon_bg_color";

    ALTER TABLE "pages_blocks_flex_highlight_cards"
    DROP COLUMN IF EXISTS "title_size";
  `)
}
