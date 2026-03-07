-- epic_8_variation_b.sql

-- Expand the seo_discoverability table to store the "Challenger" (Variation B) payload side-by-side with the Champion (Variation A).
ALTER TABLE IF EXISTS seo_discoverability
    ADD COLUMN IF NOT EXISTS title_b TEXT,
    ADD COLUMN IF NOT EXISTS description_b TEXT,
    ADD COLUMN IF NOT EXISTS keywords_b TEXT,
    ADD COLUMN IF NOT EXISTS answer_capsule_b TEXT,
    ADD COLUMN IF NOT EXISTS json_payload_b JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
