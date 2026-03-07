-- epic_7_answer_capsules.sql

-- Add the answer_capsule column for ChatGPT citations
ALTER TABLE IF EXISTS seo_discoverability 
    ADD COLUMN IF NOT EXISTS answer_capsule TEXT;
