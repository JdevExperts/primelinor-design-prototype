-- Phase 6C-1 — first-party website analytics. Additive, forward-only.

CREATE TYPE "AnalyticsEventType" AS ENUM (
  'PAGE_VIEW', 'PRODUCT_VIEW', 'PRODUCT_CARD_CLICK', 'CATEGORY_VIEW',
  'SOLUTION_VIEW', 'SEARCH', 'QUOTE_CTA_CLICK', 'RFQ_STARTED',
  'RFQ_SUBMITTED', 'WHATSAPP_CLICK', 'CONTACT_CLICK'
);

CREATE TABLE "analytics_events" (
  "id"                  TEXT NOT NULL,
  "event_type"          "AnalyticsEventType" NOT NULL,
  "visitor_id"          TEXT,
  "session_id"          TEXT,
  "path"                TEXT,
  "referrer"            TEXT,
  "referrer_group"      TEXT,
  "utm_source"          TEXT,
  "utm_medium"          TEXT,
  "utm_campaign"        TEXT,
  "product_id"          TEXT,
  "product_code"        TEXT,
  "category_id"         TEXT,
  "solution_id"         TEXT,
  "search_query"        TEXT,
  "search_result_count" INTEGER,
  "device_type"         TEXT,
  "country"             TEXT,
  "state"               TEXT,
  "city"                TEXT,
  "metadata"            JSONB,
  "is_test"             BOOLEAN NOT NULL DEFAULT false,
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "analytics_events_event_type_created_at_idx" ON "analytics_events"("event_type", "created_at");
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events"("created_at");
CREATE INDEX "analytics_events_product_id_event_type_idx" ON "analytics_events"("product_id", "event_type");
CREATE INDEX "analytics_events_visitor_id_idx" ON "analytics_events"("visitor_id");
CREATE INDEX "analytics_events_session_id_idx" ON "analytics_events"("session_id");
CREATE INDEX "analytics_events_is_test_idx" ON "analytics_events"("is_test");
