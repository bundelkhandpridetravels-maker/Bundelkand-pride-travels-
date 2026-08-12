// NOTE: Payload generates this line as a single value-import. MigrateUpArgs and
// MigrateDownArgs are TYPES, so they are split into an `import type` here —
// otherwise Node's native TypeScript stripping tries to import them as runtime
// values and the migration fails to load. The SQL below is untouched.
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'ops', 'sales', 'vendor', 'customer', 'trip_captain', 'influencer', 'b2b_partner');
  CREATE TYPE "public"."enum_leads_source" AS ENUM('website', 'whatsapp', 'instagram', 'referral', 'phone', 'other');
  CREATE TYPE "public"."enum_leads_stage" AS ENUM('new', 'contacted', 'quoted', 'won', 'lost');
  CREATE TYPE "public"."enum_leads_value_currency" AS ENUM('INR', 'USD', 'EUR', 'GBP', 'AED');
  CREATE TYPE "public"."enum_crm_activities_type" AS ENUM('call', 'email', 'whatsapp', 'meeting', 'note', 'task');
  CREATE TYPE "public"."enum_customers_source" AS ENUM('website', 'whatsapp', 'referral', 'instagram', 'walk_in', 'repeat', 'other');
  CREATE TYPE "public"."enum_customers_status" AS ENUM('active', 'inactive', 'blocked');
  CREATE TYPE "public"."enum_destinations_verification_status" AS ENUM('planned', 'scouting', 'verifying', 'verified');
  CREATE TYPE "public"."enum_destinations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__destinations_v_version_verification_status" AS ENUM('planned', 'scouting', 'verifying', 'verified');
  CREATE TYPE "public"."enum__destinations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_packages_tour_type" AS ENUM('fit', 'group', 'corporate', 'school', 'honeymoon');
  CREATE TYPE "public"."enum_packages_category" AS ENUM('budget', 'standard', 'premium', 'luxury');
  CREATE TYPE "public"."enum_packages_pickup_type" AS ENUM('airport', 'railway', 'bus', 'hotel');
  CREATE TYPE "public"."enum_packages_meal_plan" AS ENUM('ep', 'cp', 'map', 'ap');
  CREATE TYPE "public"."enum_packages_hotel_category" AS ENUM('3', '4', '5', 'premium');
  CREATE TYPE "public"."enum_packages_price_from_currency" AS ENUM('INR', 'USD', 'EUR', 'GBP', 'AED');
  CREATE TYPE "public"."enum_packages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__packages_v_version_tour_type" AS ENUM('fit', 'group', 'corporate', 'school', 'honeymoon');
  CREATE TYPE "public"."enum__packages_v_version_category" AS ENUM('budget', 'standard', 'premium', 'luxury');
  CREATE TYPE "public"."enum__packages_v_version_pickup_type" AS ENUM('airport', 'railway', 'bus', 'hotel');
  CREATE TYPE "public"."enum__packages_v_version_meal_plan" AS ENUM('ep', 'cp', 'map', 'ap');
  CREATE TYPE "public"."enum__packages_v_version_hotel_category" AS ENUM('3', '4', '5', 'premium');
  CREATE TYPE "public"."enum__packages_v_version_price_from_currency" AS ENUM('INR', 'USD', 'EUR', 'GBP', 'AED');
  CREATE TYPE "public"."enum__packages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_itineraries_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__itineraries_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_vendors_type" AS ENUM('hotel', 'dmc', 'transport', 'guide', 'activity', 'other');
  CREATE TYPE "public"."enum_vendors_verification_status" AS ENUM('unverified', 'pending', 'verified', 'rejected', 'suspended');
  CREATE TYPE "public"."enum_vendors_agreement_status" AS ENUM('none', 'draft', 'signed', 'expired');
  CREATE TYPE "public"."enum_vendors_status" AS ENUM('active', 'paused', 'archived');
  CREATE TYPE "public"."enum_hotels_amenities" AS ENUM('wifi', 'restaurant', 'parking', 'pool', 'spa', 'heating', 'power_backup');
  CREATE TYPE "public"."enum_hotels_star_category" AS ENUM('3', '4', '5', 'premium', 'boutique');
  CREATE TYPE "public"."enum_hotels_status" AS ENUM('draft', 'active', 'archived');
  CREATE TYPE "public"."enum_dmcs_services" AS ENUM('hotels', 'transport', 'guides', 'activities', 'permits', 'full');
  CREATE TYPE "public"."enum_dmcs_contract_status" AS ENUM('none', 'draft', 'signed', 'expired');
  CREATE TYPE "public"."enum_dmcs_status" AS ENUM('draft', 'active', 'archived');
  CREATE TYPE "public"."enum_transport_providers_vehicles_type" AS ENUM('sedan', 'suv', 'tempo', 'mini_bus', 'coach');
  CREATE TYPE "public"."enum_transport_providers_status" AS ENUM('draft', 'active', 'archived');
  CREATE TYPE "public"."enum_bookings_status" AS ENUM('enquiry', 'confirmed', 'partially_paid', 'paid', 'completed', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_bookings_pricing_total_currency" AS ENUM('INR', 'USD', 'EUR', 'GBP', 'AED');
  CREATE TYPE "public"."enum_bookings_pricing_paid_currency" AS ENUM('INR', 'USD', 'EUR', 'GBP', 'AED');
  CREATE TYPE "public"."enum_bookings_pricing_balance_currency" AS ENUM('INR', 'USD', 'EUR', 'GBP', 'AED');
  CREATE TYPE "public"."enum_bookings_pricing_vendor_cost_currency" AS ENUM('INR', 'USD', 'EUR', 'GBP', 'AED');
  CREATE TYPE "public"."enum_bookings_pricing_margin_currency" AS ENUM('INR', 'USD', 'EUR', 'GBP', 'AED');
  CREATE TYPE "public"."enum_bookings_pricing_payment_tier" AS ENUM('standard', 'near', 'last_minute');
  CREATE TYPE "public"."enum_payments_type" AS ENUM('advance', 'balance', 'final', 'refund', 'vendor_payout');
  CREATE TYPE "public"."enum_payments_currency" AS ENUM('INR', 'USD', 'EUR', 'GBP', 'AED');
  CREATE TYPE "public"."enum_payments_method" AS ENUM('razorpay', 'upi', 'bank', 'card', 'cash');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('pending', 'paid', 'failed', 'refunded', 'held');
  CREATE TYPE "public"."enum_influencers_platforms_platform" AS ENUM('instagram', 'youtube', 'tiktok', 'facebook');
  CREATE TYPE "public"."enum_influencers_payout_model" AS ENUM('flat', 'commission', 'barter', 'hybrid');
  CREATE TYPE "public"."enum_influencers_status" AS ENUM('prospect', 'active', 'paused', 'archived');
  CREATE TYPE "public"."enum_trip_captains_status" AS ENUM('active', 'paused', 'inactive');
  CREATE TYPE "public"."enum_reviews_source" AS ENUM('onsite', 'google', 'instagram');
  CREATE TYPE "public"."enum_reviews_sentiment" AS ENUM('positive', 'neutral', 'negative');
  CREATE TYPE "public"."enum_media_type" AS ENUM('image', 'video', 'poster', 'document');
  CREATE TYPE "public"."enum_documents_doc_type" AS ENUM('id_proof', 'passport', 'agreement', 'invoice', 'voucher', 'other');
  CREATE TYPE "public"."enum_documents_status" AS ENUM('active', 'expired', 'archived');
  CREATE TYPE "public"."enum_contracts_contract_type" AS ENUM('vendor', 'hotel', 'dmc', 'influencer', 'employment', 'freelancer', 'developer', 'nda', 'other');
  CREATE TYPE "public"."enum_contracts_status" AS ENUM('draft', 'sent', 'signed', 'expired', 'terminated');
  CREATE TYPE "public"."enum_contracts_value_currency" AS ENUM('INR', 'USD', 'EUR', 'GBP', 'AED');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'sales' NOT NULL,
  	"phone" varchar,
  	"active" boolean DEFAULT true,
  	"vendor_id" integer,
  	"avatar_id" integer,
  	"last_login_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "leads_follow_ups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"note" varchar,
  	"done" boolean DEFAULT false
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"contact_phone" varchar,
  	"contact_whatsapp" varchar,
  	"contact_email" varchar,
  	"contact_website" varchar,
  	"source" "enum_leads_source",
  	"destination_id" integer,
  	"package_id" integer,
  	"stage" "enum_leads_stage" DEFAULT 'new',
  	"owner_id" integer,
  	"value_amount" numeric DEFAULT 0,
  	"value_currency" "enum_leads_value_currency" DEFAULT 'INR',
  	"lost_reason" varchar,
  	"created_via" varchar,
  	"ai_summary" varchar,
  	"ai_score" numeric,
  	"ai_next_action" varchar,
  	"ai_last_evaluated_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "crm_activities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lead_id" integer,
  	"customer_id" integer,
  	"type" "enum_crm_activities_type" DEFAULT 'note' NOT NULL,
  	"subject" varchar NOT NULL,
  	"body" varchar,
  	"due_date" timestamp(3) with time zone,
  	"completed" boolean DEFAULT false,
  	"owner_id" integer,
  	"ai_generated" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "customers_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"contact_phone" varchar,
  	"contact_whatsapp" varchar,
  	"contact_email" varchar,
  	"contact_website" varchar,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_country" varchar DEFAULT 'India',
  	"address_pincode" varchar,
  	"address_geo" geometry(Point),
  	"source" "enum_customers_source",
  	"consent_marketing" boolean DEFAULT false,
  	"notes" varchar,
  	"ai_summary" varchar,
  	"ai_score" numeric,
  	"ai_next_action" varchar,
  	"ai_last_evaluated_at" timestamp(3) with time zone,
  	"status" "enum_customers_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "customers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"bookings_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "destinations_best_seasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"season" varchar
  );
  
  CREATE TABLE "destinations_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"highlight" varchar
  );
  
  CREATE TABLE "destinations_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "destinations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"country" varchar DEFAULT 'India',
  	"region" varchar,
  	"coordinates" geometry(Point),
  	"phase" numeric,
  	"verification_status" "enum_destinations_verification_status" DEFAULT 'planned',
  	"hero_media_id" integer,
  	"overview" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"status" "enum_destinations_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_destinations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "destinations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"vendors_id" integer
  );
  
  CREATE TABLE "_destinations_v_version_best_seasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"season" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_destinations_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"highlight" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_destinations_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_destinations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_country" varchar DEFAULT 'India',
  	"version_region" varchar,
  	"version_coordinates" geometry(Point),
  	"version_phase" numeric,
  	"version_verification_status" "enum__destinations_v_version_verification_status" DEFAULT 'planned',
  	"version_hero_media_id" integer,
  	"version_overview" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_status" "enum__destinations_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__destinations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_destinations_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"vendors_id" integer
  );
  
  CREATE TABLE "packages_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "packages_exclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "packages_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "packages_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "packages_policies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "packages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"destination_id" integer,
  	"tour_type" "enum_packages_tour_type" DEFAULT 'fit',
  	"nights" numeric,
  	"days" numeric,
  	"category" "enum_packages_category",
  	"pickup_location" varchar,
  	"pickup_type" "enum_packages_pickup_type",
  	"drop_location" varchar,
  	"meal_plan" "enum_packages_meal_plan",
  	"hotel_category" "enum_packages_hotel_category",
  	"itinerary_id" integer,
  	"price_from_amount" numeric DEFAULT 0,
  	"price_from_currency" "enum_packages_price_from_currency" DEFAULT 'INR',
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"status" "enum_packages_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_packages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "packages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"reviews_id" integer
  );
  
  CREATE TABLE "_packages_v_version_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_packages_v_version_exclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_packages_v_version_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_packages_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_packages_v_version_policies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_packages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_destination_id" integer,
  	"version_tour_type" "enum__packages_v_version_tour_type" DEFAULT 'fit',
  	"version_nights" numeric,
  	"version_days" numeric,
  	"version_category" "enum__packages_v_version_category",
  	"version_pickup_location" varchar,
  	"version_pickup_type" "enum__packages_v_version_pickup_type",
  	"version_drop_location" varchar,
  	"version_meal_plan" "enum__packages_v_version_meal_plan",
  	"version_hotel_category" "enum__packages_v_version_hotel_category",
  	"version_itinerary_id" integer,
  	"version_price_from_amount" numeric DEFAULT 0,
  	"version_price_from_currency" "enum__packages_v_version_price_from_currency" DEFAULT 'INR',
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_status" "enum__packages_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__packages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_packages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"reviews_id" integer
  );
  
  CREATE TABLE "itineraries_days_activities" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"activity" varchar
  );
  
  CREATE TABLE "itineraries_days" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day_number" numeric,
  	"title" varchar,
  	"description" varchar,
  	"meals" varchar,
  	"stay_category" varchar
  );
  
  CREATE TABLE "itineraries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"package_id" integer,
  	"destination_id" integer,
  	"version" numeric DEFAULT 1,
  	"reusable_template" boolean DEFAULT false,
  	"status" "enum_itineraries_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_itineraries_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_itineraries_v_version_days_activities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"activity" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_itineraries_v_version_days" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day_number" numeric,
  	"title" varchar,
  	"description" varchar,
  	"meals" varchar,
  	"stay_category" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_itineraries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_package_id" integer,
  	"version_destination_id" integer,
  	"version_version" numeric DEFAULT 1,
  	"version_reusable_template" boolean DEFAULT false,
  	"version_status" "enum__itineraries_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__itineraries_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "vendors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"business_name" varchar NOT NULL,
  	"type" "enum_vendors_type",
  	"owner_name" varchar,
  	"contact_phone" varchar,
  	"contact_whatsapp" varchar,
  	"contact_email" varchar,
  	"contact_website" varchar,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_country" varchar DEFAULT 'India',
  	"address_pincode" varchar,
  	"address_geo" geometry(Point),
  	"gst" varchar,
  	"pan" varchar,
  	"business_age_years" numeric,
  	"google_reviews_url" varchar,
  	"google_rating" numeric,
  	"avg_response_mins" numeric,
  	"verification_status" "enum_vendors_verification_status" DEFAULT 'unverified',
  	"agreement_status" "enum_vendors_agreement_status",
  	"quality_score" numeric,
  	"ai_summary" varchar,
  	"ai_score" numeric,
  	"ai_next_action" varchar,
  	"ai_last_evaluated_at" timestamp(3) with time zone,
  	"status" "enum_vendors_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vendors_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"destinations_id" integer,
  	"documents_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "hotels_amenities" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_hotels_amenities",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "hotels_room_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"occupancy" numeric,
  	"count" numeric,
  	"meal_plan" varchar
  );
  
  CREATE TABLE "hotels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"destination_id" integer NOT NULL,
  	"vendor_id" integer,
  	"star_category" "enum_hotels_star_category",
  	"representative" boolean DEFAULT false,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_country" varchar DEFAULT 'India',
  	"address_pincode" varchar,
  	"address_geo" geometry(Point),
  	"map_link" varchar,
  	"description" varchar,
  	"status" "enum_hotels_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hotels_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "dmcs_services" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_dmcs_services",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "dmcs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"vendor_id" integer,
  	"contact_phone" varchar,
  	"contact_whatsapp" varchar,
  	"contact_email" varchar,
  	"contact_website" varchar,
  	"contract_status" "enum_dmcs_contract_status",
  	"rating" numeric,
  	"status" "enum_dmcs_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "dmcs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"destinations_id" integer
  );
  
  CREATE TABLE "transport_providers_vehicles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_transport_providers_vehicles_type",
  	"model" varchar,
  	"capacity" numeric,
  	"count" numeric,
  	"ac" boolean DEFAULT true
  );
  
  CREATE TABLE "transport_providers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"vendor_id" integer,
  	"gps_enabled" boolean DEFAULT false,
  	"drivers_verified" boolean DEFAULT false,
  	"status" "enum_transport_providers_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "transport_providers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"destinations_id" integer
  );
  
  CREATE TABLE "bookings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"booking_ref" varchar,
  	"customer_id" integer NOT NULL,
  	"package_id" integer,
  	"trip_captain_id" integer,
  	"travel_start_date" timestamp(3) with time zone,
  	"travel_end_date" timestamp(3) with time zone,
  	"travellers_adults" numeric DEFAULT 1,
  	"travellers_children" numeric DEFAULT 0,
  	"travellers_infants" numeric DEFAULT 0,
  	"status" "enum_bookings_status" DEFAULT 'enquiry',
  	"pickup_point" varchar,
  	"drop_point" varchar,
  	"allocated_hotel_id" integer,
  	"pricing_total_amount" numeric DEFAULT 0,
  	"pricing_total_currency" "enum_bookings_pricing_total_currency" DEFAULT 'INR',
  	"pricing_paid_amount" numeric DEFAULT 0,
  	"pricing_paid_currency" "enum_bookings_pricing_paid_currency" DEFAULT 'INR',
  	"pricing_balance_amount" numeric DEFAULT 0,
  	"pricing_balance_currency" "enum_bookings_pricing_balance_currency" DEFAULT 'INR',
  	"pricing_vendor_cost_amount" numeric DEFAULT 0,
  	"pricing_vendor_cost_currency" "enum_bookings_pricing_vendor_cost_currency" DEFAULT 'INR',
  	"pricing_margin_amount" numeric DEFAULT 0,
  	"pricing_margin_currency" "enum_bookings_pricing_margin_currency" DEFAULT 'INR',
  	"pricing_payment_tier" "enum_bookings_pricing_payment_tier",
  	"source" varchar,
  	"notes" varchar,
  	"ai_summary" varchar,
  	"ai_score" numeric,
  	"ai_next_action" varchar,
  	"ai_last_evaluated_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"vendors_id" integer
  );
  
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"booking_id" integer NOT NULL,
  	"installment_number" numeric,
  	"type" "enum_payments_type",
  	"amount" numeric NOT NULL,
  	"currency" "enum_payments_currency" DEFAULT 'INR',
  	"due_date" timestamp(3) with time zone,
  	"paid_at" timestamp(3) with time zone,
  	"release_date" timestamp(3) with time zone,
  	"method" "enum_payments_method",
  	"gateway_ref" varchar,
  	"status" "enum_payments_status" DEFAULT 'pending',
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "influencers_platforms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_influencers_platforms_platform",
  	"handle" varchar,
  	"followers" numeric
  );
  
  CREATE TABLE "influencers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"niche" varchar,
  	"agreement_id" integer,
  	"payout_model" "enum_influencers_payout_model",
  	"contact_phone" varchar,
  	"contact_whatsapp" varchar,
  	"contact_email" varchar,
  	"contact_website" varchar,
  	"ai_summary" varchar,
  	"ai_score" numeric,
  	"ai_next_action" varchar,
  	"ai_last_evaluated_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"status" "enum_influencers_status" DEFAULT 'prospect',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "influencers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"destinations_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "trip_captains" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar NOT NULL,
  	"user_id" integer,
  	"influencer_id" integer,
  	"commission_rate" numeric,
  	"performance_score" numeric,
  	"referral_code" varchar,
  	"status" "enum_trip_captains_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "trip_captains_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"destinations_id" integer,
  	"bookings_id" integer
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_id" integer,
  	"booking_id" integer,
  	"package_id" integer,
  	"destination_id" integer,
  	"vendor_id" integer,
  	"rating" numeric NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"video_url" varchar,
  	"source" "enum_reviews_source",
  	"sentiment" "enum_reviews_sentiment",
  	"google_review_requested" boolean DEFAULT false,
  	"google_review_completed" boolean DEFAULT false,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "media_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"type" "enum_media_type",
  	"destination_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"doc_type" "enum_documents_doc_type",
  	"confidential" boolean DEFAULT true,
  	"expires_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"status" "enum_documents_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"customers_id" integer,
  	"vendors_id" integer,
  	"bookings_id" integer,
  	"influencers_id" integer,
  	"trip_captains_id" integer,
  	"contracts_id" integer
  );
  
  CREATE TABLE "contracts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"contract_type" "enum_contracts_contract_type",
  	"status" "enum_contracts_status" DEFAULT 'draft',
  	"effective_date" timestamp(3) with time zone,
  	"expiry_date" timestamp(3) with time zone,
  	"signed_by" varchar,
  	"value_amount" numeric DEFAULT 0,
  	"value_currency" "enum_contracts_value_currency" DEFAULT 'INR',
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contracts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"vendors_id" integer,
  	"influencers_id" integer,
  	"users_id" integer,
  	"dmcs_id" integer,
  	"transport_providers_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"leads_id" integer,
  	"crm_activities_id" integer,
  	"customers_id" integer,
  	"destinations_id" integer,
  	"packages_id" integer,
  	"itineraries_id" integer,
  	"vendors_id" integer,
  	"hotels_id" integer,
  	"dmcs_id" integer,
  	"transport_providers_id" integer,
  	"bookings_id" integer,
  	"payments_id" integer,
  	"influencers_id" integer,
  	"trip_captains_id" integer,
  	"reviews_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"contracts_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads_follow_ups" ADD CONSTRAINT "leads_follow_ups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customers_tags" ADD CONSTRAINT "customers_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers_rels" ADD CONSTRAINT "customers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers_rels" ADD CONSTRAINT "customers_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers_rels" ADD CONSTRAINT "customers_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_best_seasons" ADD CONSTRAINT "destinations_best_seasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_highlights" ADD CONSTRAINT "destinations_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_tags" ADD CONSTRAINT "destinations_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations" ADD CONSTRAINT "destinations_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "destinations" ADD CONSTRAINT "destinations_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "destinations_rels" ADD CONSTRAINT "destinations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_rels" ADD CONSTRAINT "destinations_rels_vendors_fk" FOREIGN KEY ("vendors_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_destinations_v_version_best_seasons" ADD CONSTRAINT "_destinations_v_version_best_seasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_destinations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_destinations_v_version_highlights" ADD CONSTRAINT "_destinations_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_destinations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_destinations_v_version_tags" ADD CONSTRAINT "_destinations_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_destinations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_destinations_v" ADD CONSTRAINT "_destinations_v_parent_id_destinations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_destinations_v" ADD CONSTRAINT "_destinations_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_destinations_v" ADD CONSTRAINT "_destinations_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_destinations_v_rels" ADD CONSTRAINT "_destinations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_destinations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_destinations_v_rels" ADD CONSTRAINT "_destinations_v_rels_vendors_fk" FOREIGN KEY ("vendors_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_inclusions" ADD CONSTRAINT "packages_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_exclusions" ADD CONSTRAINT "packages_exclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_videos" ADD CONSTRAINT "packages_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_faq" ADD CONSTRAINT "packages_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_policies" ADD CONSTRAINT "packages_policies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages" ADD CONSTRAINT "packages_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages" ADD CONSTRAINT "packages_itinerary_id_itineraries_id_fk" FOREIGN KEY ("itinerary_id") REFERENCES "public"."itineraries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages" ADD CONSTRAINT "packages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages_rels" ADD CONSTRAINT "packages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_rels" ADD CONSTRAINT "packages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_rels" ADD CONSTRAINT "packages_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_packages_v_version_inclusions" ADD CONSTRAINT "_packages_v_version_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_packages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_packages_v_version_exclusions" ADD CONSTRAINT "_packages_v_version_exclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_packages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_packages_v_version_videos" ADD CONSTRAINT "_packages_v_version_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_packages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_packages_v_version_faq" ADD CONSTRAINT "_packages_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_packages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_packages_v_version_policies" ADD CONSTRAINT "_packages_v_version_policies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_packages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_packages_v" ADD CONSTRAINT "_packages_v_parent_id_packages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_packages_v" ADD CONSTRAINT "_packages_v_version_destination_id_destinations_id_fk" FOREIGN KEY ("version_destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_packages_v" ADD CONSTRAINT "_packages_v_version_itinerary_id_itineraries_id_fk" FOREIGN KEY ("version_itinerary_id") REFERENCES "public"."itineraries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_packages_v" ADD CONSTRAINT "_packages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_packages_v_rels" ADD CONSTRAINT "_packages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_packages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_packages_v_rels" ADD CONSTRAINT "_packages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_packages_v_rels" ADD CONSTRAINT "_packages_v_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itineraries_days_activities" ADD CONSTRAINT "itineraries_days_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itineraries_days"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itineraries_days" ADD CONSTRAINT "itineraries_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_itineraries_v_version_days_activities" ADD CONSTRAINT "_itineraries_v_version_days_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_itineraries_v_version_days"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_itineraries_v_version_days" ADD CONSTRAINT "_itineraries_v_version_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_itineraries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_itineraries_v" ADD CONSTRAINT "_itineraries_v_parent_id_itineraries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."itineraries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_itineraries_v" ADD CONSTRAINT "_itineraries_v_version_package_id_packages_id_fk" FOREIGN KEY ("version_package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_itineraries_v" ADD CONSTRAINT "_itineraries_v_version_destination_id_destinations_id_fk" FOREIGN KEY ("version_destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vendors_rels" ADD CONSTRAINT "vendors_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vendors_rels" ADD CONSTRAINT "vendors_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vendors_rels" ADD CONSTRAINT "vendors_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vendors_rels" ADD CONSTRAINT "vendors_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotels_amenities" ADD CONSTRAINT "hotels_amenities_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotels_room_types" ADD CONSTRAINT "hotels_room_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotels" ADD CONSTRAINT "hotels_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hotels" ADD CONSTRAINT "hotels_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hotels_rels" ADD CONSTRAINT "hotels_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotels_rels" ADD CONSTRAINT "hotels_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "dmcs_services" ADD CONSTRAINT "dmcs_services_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."dmcs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "dmcs" ADD CONSTRAINT "dmcs_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "dmcs_rels" ADD CONSTRAINT "dmcs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."dmcs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "dmcs_rels" ADD CONSTRAINT "dmcs_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "transport_providers_vehicles" ADD CONSTRAINT "transport_providers_vehicles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."transport_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "transport_providers" ADD CONSTRAINT "transport_providers_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transport_providers_rels" ADD CONSTRAINT "transport_providers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."transport_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "transport_providers_rels" ADD CONSTRAINT "transport_providers_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_trip_captain_id_trip_captains_id_fk" FOREIGN KEY ("trip_captain_id") REFERENCES "public"."trip_captains"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_allocated_hotel_id_hotels_id_fk" FOREIGN KEY ("allocated_hotel_id") REFERENCES "public"."hotels"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_vendors_fk" FOREIGN KEY ("vendors_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "influencers_platforms" ADD CONSTRAINT "influencers_platforms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."influencers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "influencers" ADD CONSTRAINT "influencers_agreement_id_contracts_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "influencers_rels" ADD CONSTRAINT "influencers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."influencers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "influencers_rels" ADD CONSTRAINT "influencers_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "influencers_rels" ADD CONSTRAINT "influencers_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trip_captains" ADD CONSTRAINT "trip_captains_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trip_captains" ADD CONSTRAINT "trip_captains_influencer_id_influencers_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."influencers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trip_captains_rels" ADD CONSTRAINT "trip_captains_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trip_captains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trip_captains_rels" ADD CONSTRAINT "trip_captains_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trip_captains_rels" ADD CONSTRAINT "trip_captains_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_vendors_fk" FOREIGN KEY ("vendors_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_influencers_fk" FOREIGN KEY ("influencers_id") REFERENCES "public"."influencers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_trip_captains_fk" FOREIGN KEY ("trip_captains_id") REFERENCES "public"."trip_captains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_contracts_fk" FOREIGN KEY ("contracts_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contracts_rels" ADD CONSTRAINT "contracts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contracts_rels" ADD CONSTRAINT "contracts_rels_vendors_fk" FOREIGN KEY ("vendors_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contracts_rels" ADD CONSTRAINT "contracts_rels_influencers_fk" FOREIGN KEY ("influencers_id") REFERENCES "public"."influencers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contracts_rels" ADD CONSTRAINT "contracts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contracts_rels" ADD CONSTRAINT "contracts_rels_dmcs_fk" FOREIGN KEY ("dmcs_id") REFERENCES "public"."dmcs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contracts_rels" ADD CONSTRAINT "contracts_rels_transport_providers_fk" FOREIGN KEY ("transport_providers_id") REFERENCES "public"."transport_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contracts_rels" ADD CONSTRAINT "contracts_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_crm_activities_fk" FOREIGN KEY ("crm_activities_id") REFERENCES "public"."crm_activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_packages_fk" FOREIGN KEY ("packages_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_itineraries_fk" FOREIGN KEY ("itineraries_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vendors_fk" FOREIGN KEY ("vendors_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hotels_fk" FOREIGN KEY ("hotels_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dmcs_fk" FOREIGN KEY ("dmcs_id") REFERENCES "public"."dmcs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_transport_providers_fk" FOREIGN KEY ("transport_providers_id") REFERENCES "public"."transport_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_influencers_fk" FOREIGN KEY ("influencers_id") REFERENCES "public"."influencers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trip_captains_fk" FOREIGN KEY ("trip_captains_id") REFERENCES "public"."trip_captains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contracts_fk" FOREIGN KEY ("contracts_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_role_idx" ON "users" USING btree ("role");
  CREATE INDEX "users_active_idx" ON "users" USING btree ("active");
  CREATE INDEX "users_vendor_idx" ON "users" USING btree ("vendor_id");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "leads_follow_ups_order_idx" ON "leads_follow_ups" USING btree ("_order");
  CREATE INDEX "leads_follow_ups_parent_id_idx" ON "leads_follow_ups" USING btree ("_parent_id");
  CREATE INDEX "leads_name_idx" ON "leads" USING btree ("name");
  CREATE INDEX "leads_source_idx" ON "leads" USING btree ("source");
  CREATE INDEX "leads_destination_idx" ON "leads" USING btree ("destination_id");
  CREATE INDEX "leads_package_idx" ON "leads" USING btree ("package_id");
  CREATE INDEX "leads_stage_idx" ON "leads" USING btree ("stage");
  CREATE INDEX "leads_owner_idx" ON "leads" USING btree ("owner_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "crm_activities_lead_idx" ON "crm_activities" USING btree ("lead_id");
  CREATE INDEX "crm_activities_customer_idx" ON "crm_activities" USING btree ("customer_id");
  CREATE INDEX "crm_activities_type_idx" ON "crm_activities" USING btree ("type");
  CREATE INDEX "crm_activities_completed_idx" ON "crm_activities" USING btree ("completed");
  CREATE INDEX "crm_activities_owner_idx" ON "crm_activities" USING btree ("owner_id");
  CREATE INDEX "crm_activities_updated_at_idx" ON "crm_activities" USING btree ("updated_at");
  CREATE INDEX "crm_activities_created_at_idx" ON "crm_activities" USING btree ("created_at");
  CREATE INDEX "customers_tags_order_idx" ON "customers_tags" USING btree ("_order");
  CREATE INDEX "customers_tags_parent_id_idx" ON "customers_tags" USING btree ("_parent_id");
  CREATE INDEX "customers_name_idx" ON "customers" USING btree ("name");
  CREATE INDEX "customers_address_address_city_idx" ON "customers" USING btree ("address_city");
  CREATE INDEX "customers_address_address_country_idx" ON "customers" USING btree ("address_country");
  CREATE INDEX "customers_source_idx" ON "customers" USING btree ("source");
  CREATE INDEX "customers_status_idx" ON "customers" USING btree ("status");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE INDEX "customers_rels_order_idx" ON "customers_rels" USING btree ("order");
  CREATE INDEX "customers_rels_parent_idx" ON "customers_rels" USING btree ("parent_id");
  CREATE INDEX "customers_rels_path_idx" ON "customers_rels" USING btree ("path");
  CREATE INDEX "customers_rels_bookings_id_idx" ON "customers_rels" USING btree ("bookings_id");
  CREATE INDEX "customers_rels_documents_id_idx" ON "customers_rels" USING btree ("documents_id");
  CREATE INDEX "destinations_best_seasons_order_idx" ON "destinations_best_seasons" USING btree ("_order");
  CREATE INDEX "destinations_best_seasons_parent_id_idx" ON "destinations_best_seasons" USING btree ("_parent_id");
  CREATE INDEX "destinations_highlights_order_idx" ON "destinations_highlights" USING btree ("_order");
  CREATE INDEX "destinations_highlights_parent_id_idx" ON "destinations_highlights" USING btree ("_parent_id");
  CREATE INDEX "destinations_tags_order_idx" ON "destinations_tags" USING btree ("_order");
  CREATE INDEX "destinations_tags_parent_id_idx" ON "destinations_tags" USING btree ("_parent_id");
  CREATE INDEX "destinations_name_idx" ON "destinations" USING btree ("name");
  CREATE UNIQUE INDEX "destinations_slug_idx" ON "destinations" USING btree ("slug");
  CREATE INDEX "destinations_country_idx" ON "destinations" USING btree ("country");
  CREATE INDEX "destinations_verification_status_idx" ON "destinations" USING btree ("verification_status");
  CREATE INDEX "destinations_hero_media_idx" ON "destinations" USING btree ("hero_media_id");
  CREATE INDEX "destinations_seo_seo_og_image_idx" ON "destinations" USING btree ("seo_og_image_id");
  CREATE INDEX "destinations_status_idx" ON "destinations" USING btree ("status");
  CREATE INDEX "destinations_updated_at_idx" ON "destinations" USING btree ("updated_at");
  CREATE INDEX "destinations_created_at_idx" ON "destinations" USING btree ("created_at");
  CREATE INDEX "destinations__status_idx" ON "destinations" USING btree ("_status");
  CREATE INDEX "destinations_rels_order_idx" ON "destinations_rels" USING btree ("order");
  CREATE INDEX "destinations_rels_parent_idx" ON "destinations_rels" USING btree ("parent_id");
  CREATE INDEX "destinations_rels_path_idx" ON "destinations_rels" USING btree ("path");
  CREATE INDEX "destinations_rels_vendors_id_idx" ON "destinations_rels" USING btree ("vendors_id");
  CREATE INDEX "_destinations_v_version_best_seasons_order_idx" ON "_destinations_v_version_best_seasons" USING btree ("_order");
  CREATE INDEX "_destinations_v_version_best_seasons_parent_id_idx" ON "_destinations_v_version_best_seasons" USING btree ("_parent_id");
  CREATE INDEX "_destinations_v_version_highlights_order_idx" ON "_destinations_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_destinations_v_version_highlights_parent_id_idx" ON "_destinations_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_destinations_v_version_tags_order_idx" ON "_destinations_v_version_tags" USING btree ("_order");
  CREATE INDEX "_destinations_v_version_tags_parent_id_idx" ON "_destinations_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_destinations_v_parent_idx" ON "_destinations_v" USING btree ("parent_id");
  CREATE INDEX "_destinations_v_version_version_name_idx" ON "_destinations_v" USING btree ("version_name");
  CREATE INDEX "_destinations_v_version_version_slug_idx" ON "_destinations_v" USING btree ("version_slug");
  CREATE INDEX "_destinations_v_version_version_country_idx" ON "_destinations_v" USING btree ("version_country");
  CREATE INDEX "_destinations_v_version_version_verification_status_idx" ON "_destinations_v" USING btree ("version_verification_status");
  CREATE INDEX "_destinations_v_version_version_hero_media_idx" ON "_destinations_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_destinations_v_version_seo_version_seo_og_image_idx" ON "_destinations_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_destinations_v_version_version_status_idx" ON "_destinations_v" USING btree ("version_status");
  CREATE INDEX "_destinations_v_version_version_updated_at_idx" ON "_destinations_v" USING btree ("version_updated_at");
  CREATE INDEX "_destinations_v_version_version_created_at_idx" ON "_destinations_v" USING btree ("version_created_at");
  CREATE INDEX "_destinations_v_version_version__status_idx" ON "_destinations_v" USING btree ("version__status");
  CREATE INDEX "_destinations_v_created_at_idx" ON "_destinations_v" USING btree ("created_at");
  CREATE INDEX "_destinations_v_updated_at_idx" ON "_destinations_v" USING btree ("updated_at");
  CREATE INDEX "_destinations_v_latest_idx" ON "_destinations_v" USING btree ("latest");
  CREATE INDEX "_destinations_v_rels_order_idx" ON "_destinations_v_rels" USING btree ("order");
  CREATE INDEX "_destinations_v_rels_parent_idx" ON "_destinations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_destinations_v_rels_path_idx" ON "_destinations_v_rels" USING btree ("path");
  CREATE INDEX "_destinations_v_rels_vendors_id_idx" ON "_destinations_v_rels" USING btree ("vendors_id");
  CREATE INDEX "packages_inclusions_order_idx" ON "packages_inclusions" USING btree ("_order");
  CREATE INDEX "packages_inclusions_parent_id_idx" ON "packages_inclusions" USING btree ("_parent_id");
  CREATE INDEX "packages_exclusions_order_idx" ON "packages_exclusions" USING btree ("_order");
  CREATE INDEX "packages_exclusions_parent_id_idx" ON "packages_exclusions" USING btree ("_parent_id");
  CREATE INDEX "packages_videos_order_idx" ON "packages_videos" USING btree ("_order");
  CREATE INDEX "packages_videos_parent_id_idx" ON "packages_videos" USING btree ("_parent_id");
  CREATE INDEX "packages_faq_order_idx" ON "packages_faq" USING btree ("_order");
  CREATE INDEX "packages_faq_parent_id_idx" ON "packages_faq" USING btree ("_parent_id");
  CREATE INDEX "packages_policies_order_idx" ON "packages_policies" USING btree ("_order");
  CREATE INDEX "packages_policies_parent_id_idx" ON "packages_policies" USING btree ("_parent_id");
  CREATE INDEX "packages_title_idx" ON "packages" USING btree ("title");
  CREATE UNIQUE INDEX "packages_slug_idx" ON "packages" USING btree ("slug");
  CREATE INDEX "packages_destination_idx" ON "packages" USING btree ("destination_id");
  CREATE INDEX "packages_tour_type_idx" ON "packages" USING btree ("tour_type");
  CREATE INDEX "packages_itinerary_idx" ON "packages" USING btree ("itinerary_id");
  CREATE INDEX "packages_seo_seo_og_image_idx" ON "packages" USING btree ("seo_og_image_id");
  CREATE INDEX "packages_status_idx" ON "packages" USING btree ("status");
  CREATE INDEX "packages_updated_at_idx" ON "packages" USING btree ("updated_at");
  CREATE INDEX "packages_created_at_idx" ON "packages" USING btree ("created_at");
  CREATE INDEX "packages__status_idx" ON "packages" USING btree ("_status");
  CREATE INDEX "packages_rels_order_idx" ON "packages_rels" USING btree ("order");
  CREATE INDEX "packages_rels_parent_idx" ON "packages_rels" USING btree ("parent_id");
  CREATE INDEX "packages_rels_path_idx" ON "packages_rels" USING btree ("path");
  CREATE INDEX "packages_rels_media_id_idx" ON "packages_rels" USING btree ("media_id");
  CREATE INDEX "packages_rels_reviews_id_idx" ON "packages_rels" USING btree ("reviews_id");
  CREATE INDEX "_packages_v_version_inclusions_order_idx" ON "_packages_v_version_inclusions" USING btree ("_order");
  CREATE INDEX "_packages_v_version_inclusions_parent_id_idx" ON "_packages_v_version_inclusions" USING btree ("_parent_id");
  CREATE INDEX "_packages_v_version_exclusions_order_idx" ON "_packages_v_version_exclusions" USING btree ("_order");
  CREATE INDEX "_packages_v_version_exclusions_parent_id_idx" ON "_packages_v_version_exclusions" USING btree ("_parent_id");
  CREATE INDEX "_packages_v_version_videos_order_idx" ON "_packages_v_version_videos" USING btree ("_order");
  CREATE INDEX "_packages_v_version_videos_parent_id_idx" ON "_packages_v_version_videos" USING btree ("_parent_id");
  CREATE INDEX "_packages_v_version_faq_order_idx" ON "_packages_v_version_faq" USING btree ("_order");
  CREATE INDEX "_packages_v_version_faq_parent_id_idx" ON "_packages_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_packages_v_version_policies_order_idx" ON "_packages_v_version_policies" USING btree ("_order");
  CREATE INDEX "_packages_v_version_policies_parent_id_idx" ON "_packages_v_version_policies" USING btree ("_parent_id");
  CREATE INDEX "_packages_v_parent_idx" ON "_packages_v" USING btree ("parent_id");
  CREATE INDEX "_packages_v_version_version_title_idx" ON "_packages_v" USING btree ("version_title");
  CREATE INDEX "_packages_v_version_version_slug_idx" ON "_packages_v" USING btree ("version_slug");
  CREATE INDEX "_packages_v_version_version_destination_idx" ON "_packages_v" USING btree ("version_destination_id");
  CREATE INDEX "_packages_v_version_version_tour_type_idx" ON "_packages_v" USING btree ("version_tour_type");
  CREATE INDEX "_packages_v_version_version_itinerary_idx" ON "_packages_v" USING btree ("version_itinerary_id");
  CREATE INDEX "_packages_v_version_seo_version_seo_og_image_idx" ON "_packages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_packages_v_version_version_status_idx" ON "_packages_v" USING btree ("version_status");
  CREATE INDEX "_packages_v_version_version_updated_at_idx" ON "_packages_v" USING btree ("version_updated_at");
  CREATE INDEX "_packages_v_version_version_created_at_idx" ON "_packages_v" USING btree ("version_created_at");
  CREATE INDEX "_packages_v_version_version__status_idx" ON "_packages_v" USING btree ("version__status");
  CREATE INDEX "_packages_v_created_at_idx" ON "_packages_v" USING btree ("created_at");
  CREATE INDEX "_packages_v_updated_at_idx" ON "_packages_v" USING btree ("updated_at");
  CREATE INDEX "_packages_v_latest_idx" ON "_packages_v" USING btree ("latest");
  CREATE INDEX "_packages_v_rels_order_idx" ON "_packages_v_rels" USING btree ("order");
  CREATE INDEX "_packages_v_rels_parent_idx" ON "_packages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_packages_v_rels_path_idx" ON "_packages_v_rels" USING btree ("path");
  CREATE INDEX "_packages_v_rels_media_id_idx" ON "_packages_v_rels" USING btree ("media_id");
  CREATE INDEX "_packages_v_rels_reviews_id_idx" ON "_packages_v_rels" USING btree ("reviews_id");
  CREATE INDEX "itineraries_days_activities_order_idx" ON "itineraries_days_activities" USING btree ("_order");
  CREATE INDEX "itineraries_days_activities_parent_id_idx" ON "itineraries_days_activities" USING btree ("_parent_id");
  CREATE INDEX "itineraries_days_order_idx" ON "itineraries_days" USING btree ("_order");
  CREATE INDEX "itineraries_days_parent_id_idx" ON "itineraries_days" USING btree ("_parent_id");
  CREATE INDEX "itineraries_title_idx" ON "itineraries" USING btree ("title");
  CREATE INDEX "itineraries_package_idx" ON "itineraries" USING btree ("package_id");
  CREATE INDEX "itineraries_destination_idx" ON "itineraries" USING btree ("destination_id");
  CREATE INDEX "itineraries_status_idx" ON "itineraries" USING btree ("status");
  CREATE INDEX "itineraries_updated_at_idx" ON "itineraries" USING btree ("updated_at");
  CREATE INDEX "itineraries_created_at_idx" ON "itineraries" USING btree ("created_at");
  CREATE INDEX "itineraries__status_idx" ON "itineraries" USING btree ("_status");
  CREATE INDEX "_itineraries_v_version_days_activities_order_idx" ON "_itineraries_v_version_days_activities" USING btree ("_order");
  CREATE INDEX "_itineraries_v_version_days_activities_parent_id_idx" ON "_itineraries_v_version_days_activities" USING btree ("_parent_id");
  CREATE INDEX "_itineraries_v_version_days_order_idx" ON "_itineraries_v_version_days" USING btree ("_order");
  CREATE INDEX "_itineraries_v_version_days_parent_id_idx" ON "_itineraries_v_version_days" USING btree ("_parent_id");
  CREATE INDEX "_itineraries_v_parent_idx" ON "_itineraries_v" USING btree ("parent_id");
  CREATE INDEX "_itineraries_v_version_version_title_idx" ON "_itineraries_v" USING btree ("version_title");
  CREATE INDEX "_itineraries_v_version_version_package_idx" ON "_itineraries_v" USING btree ("version_package_id");
  CREATE INDEX "_itineraries_v_version_version_destination_idx" ON "_itineraries_v" USING btree ("version_destination_id");
  CREATE INDEX "_itineraries_v_version_version_status_idx" ON "_itineraries_v" USING btree ("version_status");
  CREATE INDEX "_itineraries_v_version_version_updated_at_idx" ON "_itineraries_v" USING btree ("version_updated_at");
  CREATE INDEX "_itineraries_v_version_version_created_at_idx" ON "_itineraries_v" USING btree ("version_created_at");
  CREATE INDEX "_itineraries_v_version_version__status_idx" ON "_itineraries_v" USING btree ("version__status");
  CREATE INDEX "_itineraries_v_created_at_idx" ON "_itineraries_v" USING btree ("created_at");
  CREATE INDEX "_itineraries_v_updated_at_idx" ON "_itineraries_v" USING btree ("updated_at");
  CREATE INDEX "_itineraries_v_latest_idx" ON "_itineraries_v" USING btree ("latest");
  CREATE INDEX "vendors_business_name_idx" ON "vendors" USING btree ("business_name");
  CREATE INDEX "vendors_type_idx" ON "vendors" USING btree ("type");
  CREATE INDEX "vendors_address_address_city_idx" ON "vendors" USING btree ("address_city");
  CREATE INDEX "vendors_address_address_country_idx" ON "vendors" USING btree ("address_country");
  CREATE INDEX "vendors_verification_status_idx" ON "vendors" USING btree ("verification_status");
  CREATE INDEX "vendors_status_idx" ON "vendors" USING btree ("status");
  CREATE INDEX "vendors_updated_at_idx" ON "vendors" USING btree ("updated_at");
  CREATE INDEX "vendors_created_at_idx" ON "vendors" USING btree ("created_at");
  CREATE INDEX "vendors_rels_order_idx" ON "vendors_rels" USING btree ("order");
  CREATE INDEX "vendors_rels_parent_idx" ON "vendors_rels" USING btree ("parent_id");
  CREATE INDEX "vendors_rels_path_idx" ON "vendors_rels" USING btree ("path");
  CREATE INDEX "vendors_rels_destinations_id_idx" ON "vendors_rels" USING btree ("destinations_id");
  CREATE INDEX "vendors_rels_documents_id_idx" ON "vendors_rels" USING btree ("documents_id");
  CREATE INDEX "vendors_rels_media_id_idx" ON "vendors_rels" USING btree ("media_id");
  CREATE INDEX "hotels_amenities_order_idx" ON "hotels_amenities" USING btree ("order");
  CREATE INDEX "hotels_amenities_parent_idx" ON "hotels_amenities" USING btree ("parent_id");
  CREATE INDEX "hotels_room_types_order_idx" ON "hotels_room_types" USING btree ("_order");
  CREATE INDEX "hotels_room_types_parent_id_idx" ON "hotels_room_types" USING btree ("_parent_id");
  CREATE INDEX "hotels_name_idx" ON "hotels" USING btree ("name");
  CREATE INDEX "hotels_destination_idx" ON "hotels" USING btree ("destination_id");
  CREATE INDEX "hotels_vendor_idx" ON "hotels" USING btree ("vendor_id");
  CREATE INDEX "hotels_star_category_idx" ON "hotels" USING btree ("star_category");
  CREATE INDEX "hotels_address_address_city_idx" ON "hotels" USING btree ("address_city");
  CREATE INDEX "hotels_address_address_country_idx" ON "hotels" USING btree ("address_country");
  CREATE INDEX "hotels_status_idx" ON "hotels" USING btree ("status");
  CREATE INDEX "hotels_updated_at_idx" ON "hotels" USING btree ("updated_at");
  CREATE INDEX "hotels_created_at_idx" ON "hotels" USING btree ("created_at");
  CREATE INDEX "hotels_rels_order_idx" ON "hotels_rels" USING btree ("order");
  CREATE INDEX "hotels_rels_parent_idx" ON "hotels_rels" USING btree ("parent_id");
  CREATE INDEX "hotels_rels_path_idx" ON "hotels_rels" USING btree ("path");
  CREATE INDEX "hotels_rels_media_id_idx" ON "hotels_rels" USING btree ("media_id");
  CREATE INDEX "dmcs_services_order_idx" ON "dmcs_services" USING btree ("order");
  CREATE INDEX "dmcs_services_parent_idx" ON "dmcs_services" USING btree ("parent_id");
  CREATE INDEX "dmcs_name_idx" ON "dmcs" USING btree ("name");
  CREATE INDEX "dmcs_vendor_idx" ON "dmcs" USING btree ("vendor_id");
  CREATE INDEX "dmcs_status_idx" ON "dmcs" USING btree ("status");
  CREATE INDEX "dmcs_updated_at_idx" ON "dmcs" USING btree ("updated_at");
  CREATE INDEX "dmcs_created_at_idx" ON "dmcs" USING btree ("created_at");
  CREATE INDEX "dmcs_rels_order_idx" ON "dmcs_rels" USING btree ("order");
  CREATE INDEX "dmcs_rels_parent_idx" ON "dmcs_rels" USING btree ("parent_id");
  CREATE INDEX "dmcs_rels_path_idx" ON "dmcs_rels" USING btree ("path");
  CREATE INDEX "dmcs_rels_destinations_id_idx" ON "dmcs_rels" USING btree ("destinations_id");
  CREATE INDEX "transport_providers_vehicles_order_idx" ON "transport_providers_vehicles" USING btree ("_order");
  CREATE INDEX "transport_providers_vehicles_parent_id_idx" ON "transport_providers_vehicles" USING btree ("_parent_id");
  CREATE INDEX "transport_providers_name_idx" ON "transport_providers" USING btree ("name");
  CREATE INDEX "transport_providers_vendor_idx" ON "transport_providers" USING btree ("vendor_id");
  CREATE INDEX "transport_providers_status_idx" ON "transport_providers" USING btree ("status");
  CREATE INDEX "transport_providers_updated_at_idx" ON "transport_providers" USING btree ("updated_at");
  CREATE INDEX "transport_providers_created_at_idx" ON "transport_providers" USING btree ("created_at");
  CREATE INDEX "transport_providers_rels_order_idx" ON "transport_providers_rels" USING btree ("order");
  CREATE INDEX "transport_providers_rels_parent_idx" ON "transport_providers_rels" USING btree ("parent_id");
  CREATE INDEX "transport_providers_rels_path_idx" ON "transport_providers_rels" USING btree ("path");
  CREATE INDEX "transport_providers_rels_destinations_id_idx" ON "transport_providers_rels" USING btree ("destinations_id");
  CREATE UNIQUE INDEX "bookings_booking_ref_idx" ON "bookings" USING btree ("booking_ref");
  CREATE INDEX "bookings_customer_idx" ON "bookings" USING btree ("customer_id");
  CREATE INDEX "bookings_package_idx" ON "bookings" USING btree ("package_id");
  CREATE INDEX "bookings_trip_captain_idx" ON "bookings" USING btree ("trip_captain_id");
  CREATE INDEX "bookings_travel_start_date_idx" ON "bookings" USING btree ("travel_start_date");
  CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");
  CREATE INDEX "bookings_allocated_hotel_idx" ON "bookings" USING btree ("allocated_hotel_id");
  CREATE INDEX "bookings_updated_at_idx" ON "bookings" USING btree ("updated_at");
  CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");
  CREATE INDEX "bookings_rels_order_idx" ON "bookings_rels" USING btree ("order");
  CREATE INDEX "bookings_rels_parent_idx" ON "bookings_rels" USING btree ("parent_id");
  CREATE INDEX "bookings_rels_path_idx" ON "bookings_rels" USING btree ("path");
  CREATE INDEX "bookings_rels_vendors_id_idx" ON "bookings_rels" USING btree ("vendors_id");
  CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id");
  CREATE INDEX "payments_type_idx" ON "payments" USING btree ("type");
  CREATE INDEX "payments_due_date_idx" ON "payments" USING btree ("due_date");
  CREATE INDEX "payments_gateway_ref_idx" ON "payments" USING btree ("gateway_ref");
  CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE INDEX "influencers_platforms_order_idx" ON "influencers_platforms" USING btree ("_order");
  CREATE INDEX "influencers_platforms_parent_id_idx" ON "influencers_platforms" USING btree ("_parent_id");
  CREATE INDEX "influencers_name_idx" ON "influencers" USING btree ("name");
  CREATE INDEX "influencers_agreement_idx" ON "influencers" USING btree ("agreement_id");
  CREATE INDEX "influencers_status_idx" ON "influencers" USING btree ("status");
  CREATE INDEX "influencers_updated_at_idx" ON "influencers" USING btree ("updated_at");
  CREATE INDEX "influencers_created_at_idx" ON "influencers" USING btree ("created_at");
  CREATE INDEX "influencers_rels_order_idx" ON "influencers_rels" USING btree ("order");
  CREATE INDEX "influencers_rels_parent_idx" ON "influencers_rels" USING btree ("parent_id");
  CREATE INDEX "influencers_rels_path_idx" ON "influencers_rels" USING btree ("path");
  CREATE INDEX "influencers_rels_destinations_id_idx" ON "influencers_rels" USING btree ("destinations_id");
  CREATE INDEX "influencers_rels_media_id_idx" ON "influencers_rels" USING btree ("media_id");
  CREATE INDEX "trip_captains_display_name_idx" ON "trip_captains" USING btree ("display_name");
  CREATE INDEX "trip_captains_user_idx" ON "trip_captains" USING btree ("user_id");
  CREATE INDEX "trip_captains_influencer_idx" ON "trip_captains" USING btree ("influencer_id");
  CREATE UNIQUE INDEX "trip_captains_referral_code_idx" ON "trip_captains" USING btree ("referral_code");
  CREATE INDEX "trip_captains_status_idx" ON "trip_captains" USING btree ("status");
  CREATE INDEX "trip_captains_updated_at_idx" ON "trip_captains" USING btree ("updated_at");
  CREATE INDEX "trip_captains_created_at_idx" ON "trip_captains" USING btree ("created_at");
  CREATE INDEX "trip_captains_rels_order_idx" ON "trip_captains_rels" USING btree ("order");
  CREATE INDEX "trip_captains_rels_parent_idx" ON "trip_captains_rels" USING btree ("parent_id");
  CREATE INDEX "trip_captains_rels_path_idx" ON "trip_captains_rels" USING btree ("path");
  CREATE INDEX "trip_captains_rels_destinations_id_idx" ON "trip_captains_rels" USING btree ("destinations_id");
  CREATE INDEX "trip_captains_rels_bookings_id_idx" ON "trip_captains_rels" USING btree ("bookings_id");
  CREATE INDEX "reviews_customer_idx" ON "reviews" USING btree ("customer_id");
  CREATE INDEX "reviews_booking_idx" ON "reviews" USING btree ("booking_id");
  CREATE INDEX "reviews_package_idx" ON "reviews" USING btree ("package_id");
  CREATE INDEX "reviews_destination_idx" ON "reviews" USING btree ("destination_id");
  CREATE INDEX "reviews_vendor_idx" ON "reviews" USING btree ("vendor_id");
  CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");
  CREATE INDEX "reviews_published_idx" ON "reviews" USING btree ("published");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews_rels_order_idx" ON "reviews_rels" USING btree ("order");
  CREATE INDEX "reviews_rels_parent_idx" ON "reviews_rels" USING btree ("parent_id");
  CREATE INDEX "reviews_rels_path_idx" ON "reviews_rels" USING btree ("path");
  CREATE INDEX "reviews_rels_media_id_idx" ON "reviews_rels" USING btree ("media_id");
  CREATE INDEX "media_tags_order_idx" ON "media_tags" USING btree ("_order");
  CREATE INDEX "media_tags_parent_id_idx" ON "media_tags" USING btree ("_parent_id");
  CREATE INDEX "media_destination_idx" ON "media" USING btree ("destination_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "documents_title_idx" ON "documents" USING btree ("title");
  CREATE INDEX "documents_doc_type_idx" ON "documents" USING btree ("doc_type");
  CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE INDEX "documents_rels_order_idx" ON "documents_rels" USING btree ("order");
  CREATE INDEX "documents_rels_parent_idx" ON "documents_rels" USING btree ("parent_id");
  CREATE INDEX "documents_rels_path_idx" ON "documents_rels" USING btree ("path");
  CREATE INDEX "documents_rels_customers_id_idx" ON "documents_rels" USING btree ("customers_id");
  CREATE INDEX "documents_rels_vendors_id_idx" ON "documents_rels" USING btree ("vendors_id");
  CREATE INDEX "documents_rels_bookings_id_idx" ON "documents_rels" USING btree ("bookings_id");
  CREATE INDEX "documents_rels_influencers_id_idx" ON "documents_rels" USING btree ("influencers_id");
  CREATE INDEX "documents_rels_trip_captains_id_idx" ON "documents_rels" USING btree ("trip_captains_id");
  CREATE INDEX "documents_rels_contracts_id_idx" ON "documents_rels" USING btree ("contracts_id");
  CREATE INDEX "contracts_title_idx" ON "contracts" USING btree ("title");
  CREATE INDEX "contracts_contract_type_idx" ON "contracts" USING btree ("contract_type");
  CREATE INDEX "contracts_status_idx" ON "contracts" USING btree ("status");
  CREATE INDEX "contracts_expiry_date_idx" ON "contracts" USING btree ("expiry_date");
  CREATE INDEX "contracts_updated_at_idx" ON "contracts" USING btree ("updated_at");
  CREATE INDEX "contracts_created_at_idx" ON "contracts" USING btree ("created_at");
  CREATE INDEX "contracts_rels_order_idx" ON "contracts_rels" USING btree ("order");
  CREATE INDEX "contracts_rels_parent_idx" ON "contracts_rels" USING btree ("parent_id");
  CREATE INDEX "contracts_rels_path_idx" ON "contracts_rels" USING btree ("path");
  CREATE INDEX "contracts_rels_vendors_id_idx" ON "contracts_rels" USING btree ("vendors_id");
  CREATE INDEX "contracts_rels_influencers_id_idx" ON "contracts_rels" USING btree ("influencers_id");
  CREATE INDEX "contracts_rels_users_id_idx" ON "contracts_rels" USING btree ("users_id");
  CREATE INDEX "contracts_rels_dmcs_id_idx" ON "contracts_rels" USING btree ("dmcs_id");
  CREATE INDEX "contracts_rels_transport_providers_id_idx" ON "contracts_rels" USING btree ("transport_providers_id");
  CREATE INDEX "contracts_rels_documents_id_idx" ON "contracts_rels" USING btree ("documents_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_crm_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("crm_activities_id");
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX "payload_locked_documents_rels_destinations_id_idx" ON "payload_locked_documents_rels" USING btree ("destinations_id");
  CREATE INDEX "payload_locked_documents_rels_packages_id_idx" ON "payload_locked_documents_rels" USING btree ("packages_id");
  CREATE INDEX "payload_locked_documents_rels_itineraries_id_idx" ON "payload_locked_documents_rels" USING btree ("itineraries_id");
  CREATE INDEX "payload_locked_documents_rels_vendors_id_idx" ON "payload_locked_documents_rels" USING btree ("vendors_id");
  CREATE INDEX "payload_locked_documents_rels_hotels_id_idx" ON "payload_locked_documents_rels" USING btree ("hotels_id");
  CREATE INDEX "payload_locked_documents_rels_dmcs_id_idx" ON "payload_locked_documents_rels" USING btree ("dmcs_id");
  CREATE INDEX "payload_locked_documents_rels_transport_providers_id_idx" ON "payload_locked_documents_rels" USING btree ("transport_providers_id");
  CREATE INDEX "payload_locked_documents_rels_bookings_id_idx" ON "payload_locked_documents_rels" USING btree ("bookings_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX "payload_locked_documents_rels_influencers_id_idx" ON "payload_locked_documents_rels" USING btree ("influencers_id");
  CREATE INDEX "payload_locked_documents_rels_trip_captains_id_idx" ON "payload_locked_documents_rels" USING btree ("trip_captains_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_contracts_id_idx" ON "payload_locked_documents_rels" USING btree ("contracts_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "leads_follow_ups" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "crm_activities" CASCADE;
  DROP TABLE "customers_tags" CASCADE;
  DROP TABLE "customers" CASCADE;
  DROP TABLE "customers_rels" CASCADE;
  DROP TABLE "destinations_best_seasons" CASCADE;
  DROP TABLE "destinations_highlights" CASCADE;
  DROP TABLE "destinations_tags" CASCADE;
  DROP TABLE "destinations" CASCADE;
  DROP TABLE "destinations_rels" CASCADE;
  DROP TABLE "_destinations_v_version_best_seasons" CASCADE;
  DROP TABLE "_destinations_v_version_highlights" CASCADE;
  DROP TABLE "_destinations_v_version_tags" CASCADE;
  DROP TABLE "_destinations_v" CASCADE;
  DROP TABLE "_destinations_v_rels" CASCADE;
  DROP TABLE "packages_inclusions" CASCADE;
  DROP TABLE "packages_exclusions" CASCADE;
  DROP TABLE "packages_videos" CASCADE;
  DROP TABLE "packages_faq" CASCADE;
  DROP TABLE "packages_policies" CASCADE;
  DROP TABLE "packages" CASCADE;
  DROP TABLE "packages_rels" CASCADE;
  DROP TABLE "_packages_v_version_inclusions" CASCADE;
  DROP TABLE "_packages_v_version_exclusions" CASCADE;
  DROP TABLE "_packages_v_version_videos" CASCADE;
  DROP TABLE "_packages_v_version_faq" CASCADE;
  DROP TABLE "_packages_v_version_policies" CASCADE;
  DROP TABLE "_packages_v" CASCADE;
  DROP TABLE "_packages_v_rels" CASCADE;
  DROP TABLE "itineraries_days_activities" CASCADE;
  DROP TABLE "itineraries_days" CASCADE;
  DROP TABLE "itineraries" CASCADE;
  DROP TABLE "_itineraries_v_version_days_activities" CASCADE;
  DROP TABLE "_itineraries_v_version_days" CASCADE;
  DROP TABLE "_itineraries_v" CASCADE;
  DROP TABLE "vendors" CASCADE;
  DROP TABLE "vendors_rels" CASCADE;
  DROP TABLE "hotels_amenities" CASCADE;
  DROP TABLE "hotels_room_types" CASCADE;
  DROP TABLE "hotels" CASCADE;
  DROP TABLE "hotels_rels" CASCADE;
  DROP TABLE "dmcs_services" CASCADE;
  DROP TABLE "dmcs" CASCADE;
  DROP TABLE "dmcs_rels" CASCADE;
  DROP TABLE "transport_providers_vehicles" CASCADE;
  DROP TABLE "transport_providers" CASCADE;
  DROP TABLE "transport_providers_rels" CASCADE;
  DROP TABLE "bookings" CASCADE;
  DROP TABLE "bookings_rels" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "influencers_platforms" CASCADE;
  DROP TABLE "influencers" CASCADE;
  DROP TABLE "influencers_rels" CASCADE;
  DROP TABLE "trip_captains" CASCADE;
  DROP TABLE "trip_captains_rels" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "reviews_rels" CASCADE;
  DROP TABLE "media_tags" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_rels" CASCADE;
  DROP TABLE "contracts" CASCADE;
  DROP TABLE "contracts_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_leads_source";
  DROP TYPE "public"."enum_leads_stage";
  DROP TYPE "public"."enum_leads_value_currency";
  DROP TYPE "public"."enum_crm_activities_type";
  DROP TYPE "public"."enum_customers_source";
  DROP TYPE "public"."enum_customers_status";
  DROP TYPE "public"."enum_destinations_verification_status";
  DROP TYPE "public"."enum_destinations_status";
  DROP TYPE "public"."enum__destinations_v_version_verification_status";
  DROP TYPE "public"."enum__destinations_v_version_status";
  DROP TYPE "public"."enum_packages_tour_type";
  DROP TYPE "public"."enum_packages_category";
  DROP TYPE "public"."enum_packages_pickup_type";
  DROP TYPE "public"."enum_packages_meal_plan";
  DROP TYPE "public"."enum_packages_hotel_category";
  DROP TYPE "public"."enum_packages_price_from_currency";
  DROP TYPE "public"."enum_packages_status";
  DROP TYPE "public"."enum__packages_v_version_tour_type";
  DROP TYPE "public"."enum__packages_v_version_category";
  DROP TYPE "public"."enum__packages_v_version_pickup_type";
  DROP TYPE "public"."enum__packages_v_version_meal_plan";
  DROP TYPE "public"."enum__packages_v_version_hotel_category";
  DROP TYPE "public"."enum__packages_v_version_price_from_currency";
  DROP TYPE "public"."enum__packages_v_version_status";
  DROP TYPE "public"."enum_itineraries_status";
  DROP TYPE "public"."enum__itineraries_v_version_status";
  DROP TYPE "public"."enum_vendors_type";
  DROP TYPE "public"."enum_vendors_verification_status";
  DROP TYPE "public"."enum_vendors_agreement_status";
  DROP TYPE "public"."enum_vendors_status";
  DROP TYPE "public"."enum_hotels_amenities";
  DROP TYPE "public"."enum_hotels_star_category";
  DROP TYPE "public"."enum_hotels_status";
  DROP TYPE "public"."enum_dmcs_services";
  DROP TYPE "public"."enum_dmcs_contract_status";
  DROP TYPE "public"."enum_dmcs_status";
  DROP TYPE "public"."enum_transport_providers_vehicles_type";
  DROP TYPE "public"."enum_transport_providers_status";
  DROP TYPE "public"."enum_bookings_status";
  DROP TYPE "public"."enum_bookings_pricing_total_currency";
  DROP TYPE "public"."enum_bookings_pricing_paid_currency";
  DROP TYPE "public"."enum_bookings_pricing_balance_currency";
  DROP TYPE "public"."enum_bookings_pricing_vendor_cost_currency";
  DROP TYPE "public"."enum_bookings_pricing_margin_currency";
  DROP TYPE "public"."enum_bookings_pricing_payment_tier";
  DROP TYPE "public"."enum_payments_type";
  DROP TYPE "public"."enum_payments_currency";
  DROP TYPE "public"."enum_payments_method";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_influencers_platforms_platform";
  DROP TYPE "public"."enum_influencers_payout_model";
  DROP TYPE "public"."enum_influencers_status";
  DROP TYPE "public"."enum_trip_captains_status";
  DROP TYPE "public"."enum_reviews_source";
  DROP TYPE "public"."enum_reviews_sentiment";
  DROP TYPE "public"."enum_media_type";
  DROP TYPE "public"."enum_documents_doc_type";
  DROP TYPE "public"."enum_documents_status";
  DROP TYPE "public"."enum_contracts_contract_type";
  DROP TYPE "public"."enum_contracts_status";
  DROP TYPE "public"."enum_contracts_value_currency";`)
}
