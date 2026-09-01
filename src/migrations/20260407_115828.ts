import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_form_layout"
    ALTER COLUMN "section_description" TYPE jsonb
    USING CASE
      WHEN "section_description" IS NULL OR btrim("section_description") = '' THEN NULL
      ELSE jsonb_build_object(
        'root',
        jsonb_build_object(
          'type', 'root',
          'format', '',
          'indent', 0,
          'version', 1,
          'children', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'format', '',
              'indent', 0,
              'version', 1,
              'children', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'detail', 0,
                  'format', 0,
                  'mode', 'normal',
                  'style', '',
                  'text', "section_description",
                  'version', 1
                )
              )
            )
          )
        )
      )
    END;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_form_layout"
    ALTER COLUMN "section_description" TYPE varchar
    USING CASE
      WHEN "section_description" IS NULL THEN NULL
      ELSE COALESCE("section_description" #>> '{root,children,0,children,0,text}', '')
    END;
  `)
}
