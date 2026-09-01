import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_quick_access_bar_items_color_variant" AS ENUM('primary', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_call_to_action_layout" AS ENUM('default', 'duccBanner');
  CREATE TYPE "public"."enum_pages_blocks_faq_layout" AS ENUM('default', 'duccAccordion');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_layout" AS ENUM('default', 'duccQuote');
  ALTER TYPE "public"."enum_pages_blocks_hero_layout" ADD VALUE 'duccFullscreen' BEFORE 'split';
  ALTER TYPE "public"."enum_pages_blocks_statistics_layout" ADD VALUE 'duccStrip';
  ALTER TYPE "public"."enum_pages_blocks_news_updates_layout" ADD VALUE 'duccCards';
  ALTER TYPE "public"."enum_pages_blocks_feature_cards_card_layout" ADD VALUE 'duccService';
  CREATE TABLE "pages_blocks_hero_ducc_floating_card_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_quick_access_bar_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"icon" varchar,
  	"link" varchar,
  	"external" boolean DEFAULT false,
  	"color_variant" "enum_pages_blocks_hero_quick_access_bar_items_color_variant" DEFAULT 'primary'
  );
  
  ALTER TABLE "site_settings" ALTER COLUMN "theme_colors_primary_color" SET DEFAULT '#4B2E83';
  ALTER TABLE "site_settings" ALTER COLUMN "theme_colors_secondary_color" SET DEFAULT '#1A103D';
  ALTER TABLE "site_settings" ALTER COLUMN "theme_colors_accent_color" SET DEFAULT '#EAB308';
  ALTER TABLE "site_settings" ALTER COLUMN "theme_colors_muted_background_color" SET DEFAULT '#F8F4FF';
  ALTER TABLE "site_settings" ALTER COLUMN "theme_colors_text_color" SET DEFAULT '#1A103D';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_eyebrow" varchar DEFAULT 'ESTABLISHED 1956';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_show_video_button" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_video_url" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_video_button_label" varchar DEFAULT 'Watch Video';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_floating_card_enabled" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_floating_card_badge_label" varchar DEFAULT 'Live Snapshot';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_floating_card_footer_text" varchar DEFAULT 'Updated Real-time';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_floating_card_footer_link" varchar DEFAULT '/about';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_floating_card_footer_link_label" varchar DEFAULT 'View dashboard →';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_show_slide_counter" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "ducc_show_play_pause" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "quick_access_bar_enabled" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "quick_access_bar_overlap_amount" numeric DEFAULT 80;
  ALTER TABLE "pages_blocks_feature_cards_cards" ADD COLUMN "tag" varchar;
  ALTER TABLE "pages_blocks_feature_cards_cards" ADD COLUMN "external" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_feature_cards" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_feature_cards" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "pages_blocks_feature_cards" ADD COLUMN "cta_link" varchar;
  ALTER TABLE "pages_blocks_call_to_action" ADD COLUMN "layout" "enum_pages_blocks_call_to_action_layout" DEFAULT 'default';
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "layout" "enum_pages_blocks_faq_layout" DEFAULT 'default';
  ALTER TABLE "pages_blocks_testimonials_items" ADD COLUMN "initials" varchar;
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "layout" "enum_pages_blocks_testimonials_layout" DEFAULT 'default';
  ALTER TABLE "pages_blocks_hero_ducc_floating_card_stats" ADD CONSTRAINT "pages_blocks_hero_ducc_floating_card_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_quick_access_bar_items" ADD CONSTRAINT "pages_blocks_hero_quick_access_bar_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_ducc_floating_card_stats_order_idx" ON "pages_blocks_hero_ducc_floating_card_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_ducc_floating_card_stats_parent_id_idx" ON "pages_blocks_hero_ducc_floating_card_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_quick_access_bar_items_order_idx" ON "pages_blocks_hero_quick_access_bar_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_quick_access_bar_items_parent_id_idx" ON "pages_blocks_hero_quick_access_bar_items" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero_ducc_floating_card_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero_quick_access_bar_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_hero_ducc_floating_card_stats" CASCADE;
  DROP TABLE "pages_blocks_hero_quick_access_bar_items" CASCADE;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "layout" SET DEFAULT 'fullWidth'::text;
  DROP TYPE "public"."enum_pages_blocks_hero_layout";
  CREATE TYPE "public"."enum_pages_blocks_hero_layout" AS ENUM('fullWidth', 'fullscreenOverlayCarousel', 'split', 'contained');
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "layout" SET DEFAULT 'fullWidth'::"public"."enum_pages_blocks_hero_layout";
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_blocks_hero_layout" USING "layout"::"public"."enum_pages_blocks_hero_layout";
  ALTER TABLE "pages_blocks_statistics" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_statistics" ALTER COLUMN "layout" SET DEFAULT 'cardGrid'::text;
  DROP TYPE "public"."enum_pages_blocks_statistics_layout";
  CREATE TYPE "public"."enum_pages_blocks_statistics_layout" AS ENUM('cardGrid', 'circularRings', 'interlockingRings');
  ALTER TABLE "pages_blocks_statistics" ALTER COLUMN "layout" SET DEFAULT 'cardGrid'::"public"."enum_pages_blocks_statistics_layout";
  ALTER TABLE "pages_blocks_statistics" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_blocks_statistics_layout" USING "layout"::"public"."enum_pages_blocks_statistics_layout";
  ALTER TABLE "pages_blocks_news_updates" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_news_updates" ALTER COLUMN "layout" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_pages_blocks_news_updates_layout";
  CREATE TYPE "public"."enum_pages_blocks_news_updates_layout" AS ENUM('cards', 'spotlight');
  ALTER TABLE "pages_blocks_news_updates" ALTER COLUMN "layout" SET DEFAULT 'cards'::"public"."enum_pages_blocks_news_updates_layout";
  ALTER TABLE "pages_blocks_news_updates" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_blocks_news_updates_layout" USING "layout"::"public"."enum_pages_blocks_news_updates_layout";
  ALTER TABLE "pages_blocks_feature_cards" ALTER COLUMN "card_layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_feature_cards" ALTER COLUMN "card_layout" SET DEFAULT 'classic'::text;
  DROP TYPE "public"."enum_pages_blocks_feature_cards_card_layout";
  CREATE TYPE "public"."enum_pages_blocks_feature_cards_card_layout" AS ENUM('classic', 'minimal', 'split', 'accentTop');
  ALTER TABLE "pages_blocks_feature_cards" ALTER COLUMN "card_layout" SET DEFAULT 'classic'::"public"."enum_pages_blocks_feature_cards_card_layout";
  ALTER TABLE "pages_blocks_feature_cards" ALTER COLUMN "card_layout" SET DATA TYPE "public"."enum_pages_blocks_feature_cards_card_layout" USING "card_layout"::"public"."enum_pages_blocks_feature_cards_card_layout";
  ALTER TABLE "site_settings" ALTER COLUMN "theme_colors_primary_color" SET DEFAULT '#1E40AF';
  ALTER TABLE "site_settings" ALTER COLUMN "theme_colors_secondary_color" SET DEFAULT '#9333EA';
  ALTER TABLE "site_settings" ALTER COLUMN "theme_colors_accent_color" SET DEFAULT '#F59E0B';
  ALTER TABLE "site_settings" ALTER COLUMN "theme_colors_muted_background_color" SET DEFAULT '#F1F5F9';
  ALTER TABLE "site_settings" ALTER COLUMN "theme_colors_text_color" SET DEFAULT '#111827';
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_eyebrow";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_show_video_button";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_video_url";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_video_button_label";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_floating_card_enabled";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_floating_card_badge_label";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_floating_card_footer_text";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_floating_card_footer_link";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_floating_card_footer_link_label";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_show_slide_counter";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "ducc_show_play_pause";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "quick_access_bar_enabled";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "quick_access_bar_overlap_amount";
  ALTER TABLE "pages_blocks_feature_cards_cards" DROP COLUMN "tag";
  ALTER TABLE "pages_blocks_feature_cards_cards" DROP COLUMN "external";
  ALTER TABLE "pages_blocks_feature_cards" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_feature_cards" DROP COLUMN "cta_label";
  ALTER TABLE "pages_blocks_feature_cards" DROP COLUMN "cta_link";
  ALTER TABLE "pages_blocks_call_to_action" DROP COLUMN "layout";
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "layout";
  ALTER TABLE "pages_blocks_testimonials_items" DROP COLUMN "initials";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "layout";
  DROP TYPE "public"."enum_pages_blocks_hero_quick_access_bar_items_color_variant";
  DROP TYPE "public"."enum_pages_blocks_call_to_action_layout";
  DROP TYPE "public"."enum_pages_blocks_faq_layout";
  DROP TYPE "public"."enum_pages_blocks_testimonials_layout";`)
}
