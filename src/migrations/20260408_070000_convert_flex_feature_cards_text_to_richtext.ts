import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_flex_feature_cards_cards"
    ALTER COLUMN "title" TYPE jsonb
    USING (
      CASE
        WHEN "title" IS NULL OR btrim("title") = '' THEN NULL
        ELSE jsonb_build_object(
          'root',
          jsonb_build_object(
            'type', 'root',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'paragraph',
                'version', 1,
                'children', jsonb_build_array(
                  jsonb_build_object(
                    'type', 'text',
                    'version', 1,
                    'text', "title",
                    'detail', 0,
                    'format', 0,
                    'mode', 'normal',
                    'style', ''
                  )
                ),
                'direction', 'ltr',
                'format', '',
                'indent', 0,
                'textFormat', 0,
                'textStyle', ''
              )
            ),
            'direction', 'ltr',
            'format', '',
            'indent', 0,
            'version', 1
          )
        )
      END
    );

    ALTER TABLE "pages_blocks_flex_feature_cards_cards"
    ALTER COLUMN "description" TYPE jsonb
    USING (
      CASE
        WHEN "description" IS NULL OR btrim("description") = '' THEN NULL
        ELSE jsonb_build_object(
          'root',
          jsonb_build_object(
            'type', 'root',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'paragraph',
                'version', 1,
                'children', jsonb_build_array(
                  jsonb_build_object(
                    'type', 'text',
                    'version', 1,
                    'text', "description",
                    'detail', 0,
                    'format', 0,
                    'mode', 'normal',
                    'style', ''
                  )
                ),
                'direction', 'ltr',
                'format', '',
                'indent', 0,
                'textFormat', 0,
                'textStyle', ''
              )
            ),
            'direction', 'ltr',
            'format', '',
            'indent', 0,
            'version', 1
          )
        )
      END
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_flex_feature_cards_cards"
    ALTER COLUMN "title" TYPE varchar
    USING (
      CASE
        WHEN "title" IS NULL THEN NULL
        WHEN jsonb_typeof("title") = 'object' THEN COALESCE("title" #>> '{root,children,0,children,0,text}', '')
        ELSE "title"::text
      END
    );

    ALTER TABLE "pages_blocks_flex_feature_cards_cards"
    ALTER COLUMN "description" TYPE varchar
    USING (
      CASE
        WHEN "description" IS NULL THEN NULL
        WHEN jsonb_typeof("description") = 'object' THEN COALESCE("description" #>> '{root,children,0,children,0,text}', '')
        ELSE "description"::text
      END
    );
  `)
}
