import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_flex_buttons" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "alignment" varchar DEFAULT 'left',
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_flex_buttons_buttons" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "url" varchar,
      "variant" varchar DEFAULT 'primary',
      "size" varchar DEFAULT 'md',
      "icon" varchar,
      "open_in_new_tab" boolean DEFAULT false
    );

    CREATE INDEX IF NOT EXISTS "pages_blocks_flex_buttons_order_idx" ON "pages_blocks_flex_buttons" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_flex_buttons_parent_id_idx" ON "pages_blocks_flex_buttons" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_flex_buttons_buttons_order_idx" ON "pages_blocks_flex_buttons_buttons" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_flex_buttons_buttons_parent_id_idx" ON "pages_blocks_flex_buttons_buttons" ("_parent_id");

    DO $$ BEGIN
      ALTER TABLE "pages_blocks_flex_buttons"
      ADD CONSTRAINT "pages_blocks_flex_buttons_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "pages_blocks_flex_buttons_buttons"
      ADD CONSTRAINT "pages_blocks_flex_buttons_buttons_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_flex_buttons"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_flex_buttons_buttons" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_flex_buttons" CASCADE;
  `)
}
