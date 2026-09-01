import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_goa_snapshot_view_options_default_view" AS ENUM(
        'district', 'taluka', 'schoolTypeManagement', 'minoritySchools', 'girlsOnlySchools', 'boysOnlySchools', 'mediumOfInstruction'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_goa_snapshot_view_options_available_views" AS ENUM(
        'district', 'taluka', 'schoolTypeManagement', 'minoritySchools', 'girlsOnlySchools', 'boysOnlySchools', 'mediumOfInstruction'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_goa_snapshot_filter_settings_filter_by" AS ENUM(
        'district', 'taluka', 'schoolType', 'managementType', 'medium'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_goa_snapshot_layout_columns_on_desktop" AS ENUM('2', '3', '4');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_goa_snapshot_layout_card_shadow" AS ENUM('none', 'soft', 'medium', 'strong');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "pages_blocks_goa_snapshot" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "is_enabled" boolean DEFAULT true,
      "section_title" varchar DEFAULT 'Goa School Snapshots' NOT NULL,
      "view_options_default_view" "enum_pages_blocks_goa_snapshot_view_options_default_view" DEFAULT 'schoolTypeManagement' NOT NULL,
      "layout_show_filter_panel" boolean DEFAULT true,
      "layout_show_left_panel" boolean DEFAULT true,
      "layout_show_middle_panel" boolean DEFAULT true,
      "layout_show_right_panel" boolean DEFAULT true,
      "layout_columns_on_desktop" "enum_pages_blocks_goa_snapshot_layout_columns_on_desktop" DEFAULT '3',
      "layout_card_spacing" numeric DEFAULT 24,
      "layout_card_border_radius" numeric DEFAULT 16,
      "layout_card_shadow" "enum_pages_blocks_goa_snapshot_layout_card_shadow" DEFAULT 'soft',
      "filter_settings_enable_filters" boolean DEFAULT true,
      "filter_settings_apply_filter_button" varchar DEFAULT 'Apply Filter',
      "statistics_minority_schools" numeric DEFAULT 0,
      "statistics_girls_only_schools" numeric DEFAULT 0,
      "statistics_boys_only_schools" numeric DEFAULT 0,
      "statistics_english_medium" numeric DEFAULT 0,
      "statistics_konkani_medium" numeric DEFAULT 0,
      "statistics_marathi_medium" numeric DEFAULT 0,
      "map_settings_zoom" numeric DEFAULT 8,
      "map_settings_center_lat" numeric DEFAULT 15.2993,
      "map_settings_center_lng" numeric DEFAULT 74.124,
      "map_settings_colors_map_background" varchar DEFAULT '#f8fafc',
      "map_settings_colors_marker_color" varchar DEFAULT '#1f9d8f',
      "map_settings_colors_active_marker_color" varchar DEFAULT '#1d4ed8',
      "map_settings_marker_settings_size" numeric DEFAULT 10,
      "map_settings_marker_settings_active_size" numeric DEFAULT 14,
      "map_settings_marker_settings_show_pulse" boolean DEFAULT true,
      "styles_font_family" varchar DEFAULT 'inherit',
      "styles_title_color" varchar DEFAULT '#0f172a',
      "styles_card_background" varchar DEFAULT '#ffffff',
      "styles_table_header_background" varchar DEFAULT '#1e3a8a',
      "animations_enable_hover_effects" boolean DEFAULT true,
      "animations_enable_entry_animation" boolean DEFAULT true,
      "block_name" varchar,
      CONSTRAINT "pages_blocks_goa_snapshot_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id")
        ON DELETE cascade ON UPDATE no action
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_goa_snapshot_view_options_available_views" (
      "order" integer NOT NULL,
      "parent_id" varchar NOT NULL,
      "value" "enum_pages_blocks_goa_snapshot_view_options_available_views",
      "id" serial PRIMARY KEY NOT NULL,
      CONSTRAINT "pages_blocks_goa_snapshot_view_options_available_views_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_goa_snapshot"("id")
        ON DELETE cascade ON UPDATE no action
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_filter_by" (
      "order" integer NOT NULL,
      "parent_id" varchar NOT NULL,
      "value" "enum_pages_blocks_goa_snapshot_filter_settings_filter_by",
      "id" serial PRIMARY KEY NOT NULL,
      CONSTRAINT "pages_blocks_goa_snapshot_filter_settings_filter_by_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_goa_snapshot"("id")
        ON DELETE cascade ON UPDATE no action
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_district_data" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "total_schools" numeric DEFAULT 0,
      "percentage" numeric DEFAULT 0,
      "marker_lat" numeric,
      "marker_lng" numeric,
      "highlight_color" varchar DEFAULT '#1f9d8f',
      CONSTRAINT "pages_blocks_goa_snapshot_filter_settings_district_data_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_goa_snapshot"("id")
        ON DELETE cascade ON UPDATE no action
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_taluka_data" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "total_schools" numeric DEFAULT 0,
      "percentage" numeric DEFAULT 0,
      "marker_lat" numeric,
      "marker_lng" numeric,
      "highlight_color" varchar DEFAULT '#1f9d8f',
      CONSTRAINT "pages_blocks_goa_snapshot_filter_settings_taluka_data_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_goa_snapshot"("id")
        ON DELETE cascade ON UPDATE no action
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_school_type_data" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "total_schools" numeric DEFAULT 0,
      "percentage" numeric DEFAULT 0,
      "marker_lat" numeric,
      "marker_lng" numeric,
      "highlight_color" varchar DEFAULT '#1f9d8f',
      CONSTRAINT "pages_blocks_goa_snapshot_filter_settings_school_type_data_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_goa_snapshot"("id")
        ON DELETE cascade ON UPDATE no action
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_goa_snapshot_merged_talukas" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "original_name" varchar NOT NULL,
      "merged_name" varchar NOT NULL,
      CONSTRAINT "pages_blocks_goa_snapshot_merged_talukas_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_goa_snapshot"("id")
        ON DELETE cascade ON UPDATE no action
    );

    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_order_idx" ON "pages_blocks_goa_snapshot" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_parent_id_idx" ON "pages_blocks_goa_snapshot" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_path_idx" ON "pages_blocks_goa_snapshot" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_view_options_available_views_order_idx" ON "pages_blocks_goa_snapshot_view_options_available_views" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_view_options_available_views_parent_idx" ON "pages_blocks_goa_snapshot_view_options_available_views" USING btree ("parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_filter_by_order_idx" ON "pages_blocks_goa_snapshot_filter_settings_filter_by" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_filter_by_parent_idx" ON "pages_blocks_goa_snapshot_filter_settings_filter_by" USING btree ("parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_district_data_order_idx" ON "pages_blocks_goa_snapshot_filter_settings_district_data" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_district_data_parent_id_idx" ON "pages_blocks_goa_snapshot_filter_settings_district_data" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_taluka_data_order_idx" ON "pages_blocks_goa_snapshot_filter_settings_taluka_data" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_taluka_data_parent_id_idx" ON "pages_blocks_goa_snapshot_filter_settings_taluka_data" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_school_type_data_order_idx" ON "pages_blocks_goa_snapshot_filter_settings_school_type_data" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_filter_settings_school_type_data_parent_id_idx" ON "pages_blocks_goa_snapshot_filter_settings_school_type_data" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_merged_talukas_order_idx" ON "pages_blocks_goa_snapshot_merged_talukas" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_goa_snapshot_merged_talukas_parent_id_idx" ON "pages_blocks_goa_snapshot_merged_talukas" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_goa_snapshot_merged_talukas";
    DROP TABLE IF EXISTS "pages_blocks_goa_snapshot_filter_settings_school_type_data";
    DROP TABLE IF EXISTS "pages_blocks_goa_snapshot_filter_settings_taluka_data";
    DROP TABLE IF EXISTS "pages_blocks_goa_snapshot_filter_settings_district_data";
    DROP TABLE IF EXISTS "pages_blocks_goa_snapshot_filter_settings_filter_by";
    DROP TABLE IF EXISTS "pages_blocks_goa_snapshot_view_options_available_views";
    DROP TABLE IF EXISTS "pages_blocks_goa_snapshot";

    DROP TYPE IF EXISTS "public"."enum_pages_blocks_goa_snapshot_layout_card_shadow";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_goa_snapshot_layout_columns_on_desktop";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_goa_snapshot_filter_settings_filter_by";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_goa_snapshot_view_options_available_views";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_goa_snapshot_view_options_default_view";
  `)
}
