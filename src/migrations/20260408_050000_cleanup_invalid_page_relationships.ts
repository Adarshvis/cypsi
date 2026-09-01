import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "pages"
    SET "parent_id" = NULL
    WHERE "parent_id" IS NOT NULL
      AND "parent_id" NOT IN (SELECT "id" FROM "pages");

    DELETE FROM "header_nav_items_children"
    WHERE "page_id" IS NOT NULL
      AND "page_id" NOT IN (SELECT "id" FROM "pages");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`SELECT 1;`)
}
