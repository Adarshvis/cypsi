import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'enum_pages_blocks_feature_cards_card_layout'
          AND n.nspname = 'public'
      ) THEN
        CREATE TYPE "public"."enum_pages_blocks_feature_cards_card_layout" AS ENUM('classic', 'minimal', 'split', 'accentTop');
      END IF;
    END
    $$;

    ALTER TABLE "pages_blocks_feature_cards"
      ADD COLUMN IF NOT EXISTS "card_layout" "enum_pages_blocks_feature_cards_card_layout" DEFAULT 'classic';

    ALTER TABLE "pages_blocks_feature_cards_cards"
      ALTER COLUMN "title" DROP NOT NULL;

    ALTER TABLE "pages_blocks_feature_cards_cards"
      ALTER COLUMN "title" TYPE jsonb
      USING CASE
        WHEN "title" IS NULL OR btrim("title") = '' THEN NULL
        ELSE jsonb_build_object(
          'root',
          jsonb_build_object(
            'type', 'root',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'paragraph',
                'children', jsonb_build_array(
                  jsonb_build_object(
                    'type', 'text',
                    'text', "title",
                    'detail', 0,
                    'format', 0,
                    'mode', 'normal',
                    'style', '',
                    'version', 1
                  )
                ),
                'direction', 'ltr',
                'format', '',
                'indent', 0,
                'version', 1
              )
            ),
            'direction', 'ltr',
            'format', '',
            'indent', 0,
            'version', 1
          )
        )
      END;

    ALTER TABLE "pages_blocks_feature_cards_cards"
      ALTER COLUMN "description" TYPE jsonb
      USING CASE
        WHEN "description" IS NULL OR btrim("description") = '' THEN NULL
        ELSE jsonb_build_object(
          'root',
          jsonb_build_object(
            'type', 'root',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'paragraph',
                'children', jsonb_build_array(
                  jsonb_build_object(
                    'type', 'text',
                    'text', "description",
                    'detail', 0,
                    'format', 0,
                    'mode', 'normal',
                    'style', '',
                    'version', 1
                  )
                ),
                'direction', 'ltr',
                'format', '',
                'indent', 0,
                'version', 1
              )
            ),
            'direction', 'ltr',
            'format', '',
            'indent', 0,
            'version', 1
          )
        )
      END;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_feature_cards_cards"
      ALTER COLUMN "title" TYPE varchar
      USING CASE
        WHEN "title" IS NULL THEN NULL
        WHEN jsonb_typeof("title") = 'object' THEN COALESCE("title"->'root'->'children'->0->'children'->0->>'text', '')
        ELSE "title"::text
      END;

    ALTER TABLE "pages_blocks_feature_cards_cards"
      ALTER COLUMN "title" SET NOT NULL;

    ALTER TABLE "pages_blocks_feature_cards_cards"
      ALTER COLUMN "description" TYPE varchar
      USING CASE
        WHEN "description" IS NULL THEN NULL
        WHEN jsonb_typeof("description") = 'object' THEN COALESCE("description"->'root'->'children'->0->'children'->0->>'text', '')
        ELSE "description"::text
      END;

    ALTER TABLE "pages_blocks_feature_cards"
      DROP COLUMN IF EXISTS "card_layout";

    DROP TYPE IF EXISTS "public"."enum_pages_blocks_feature_cards_card_layout";
  `)
}
