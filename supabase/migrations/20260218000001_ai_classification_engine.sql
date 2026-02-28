-- ============================================================
-- AI Classification Engine — Self-Learning Document Matcher
-- ============================================================
-- This schema powers a local AI that classifies incoming
-- scanned documents by matching OCR-extracted text against
-- known entities. It learns from manual corrections to
-- improve accuracy over time.
-- ============================================================

-- ┌──────────────────────────────────────────────────────────┐
-- │  1. AI MATCHING RULES (Learnable Weights)                │
-- │  Each rule represents a matching strategy. Weights are   │
-- │  adjusted ±δ on every feedback event.                    │
-- └──────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.ai_matching_rules (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_name       TEXT NOT NULL UNIQUE,
    description     TEXT,
    
    -- The weight this strategy contributes to the confidence score.
    -- Starts at a default, adjusted by feedback. Range: 0.0 – 1.0
    weight          NUMERIC(5,4) NOT NULL DEFAULT 0.5000,
    
    -- How much a single correction adjusts the weight
    learning_rate   NUMERIC(5,4) NOT NULL DEFAULT 0.0200,
    
    -- Counters for performance tracking
    times_correct   INTEGER DEFAULT 0,
    times_wrong     INTEGER DEFAULT 0,
    
    -- Rule status
    active          BOOLEAN DEFAULT true,
    
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed the default matching strategies
INSERT INTO public.ai_matching_rules (rule_name, description, weight, learning_rate) VALUES
    ('entity_name_exact',       'Exact entity name found in OCR text',                           0.9500, 0.0100),
    ('entity_name_fuzzy',       'Fuzzy match on entity name (Levenshtein ≤ 3)',                  0.7000, 0.0200),
    ('sovereign_name_match',    'Matching core name after stripping legal suffix (LLC, INC)',   0.8500, 0.0150),
    ('sunbiz_doc_number',       'SunBiz document number found in OCR text',                      0.9800, 0.0050),
    ('registered_agent_address','Our registered agent address found in document',                 0.6000, 0.0300),
    ('case_number_pattern',     'Court case number pattern matched to known filing',              0.8500, 0.0150),
    ('sender_return_address',   'Sender return address matched to known court/agency',            0.5500, 0.0250),
    ('historical_sender',       'This sender previously sent docs for this entity',               0.7500, 0.0200),
    ('document_type_pattern',   'Document type keywords matched (SOP, subpoena, annual report)', 0.4000, 0.0300),
    ('ein_tin_match',           'EIN or TIN number matched to entity',                            0.9200, 0.0100),
    ('hub_address_routing',     'Hub address code extracted and matched',                         0.8000, 0.0150),
    ('form_id_match',           'Government Form ID detected (Form 1040, SS-4, etc.)',           0.4500, 0.0250),
    ('principal_address_match', 'Entity principal address found in OCR text',                    0.6000, 0.0200),
    ('phonetic_name_match',     'Phonetic similarity match for entity name',                      0.4000, 0.0300)
ON CONFLICT (rule_name) DO NOTHING;


-- ┌──────────────────────────────────────────────────────────┐
-- │  2. AI CLASSIFICATION FEEDBACK (Learning Signal)         │
-- │  Every Accept / Override / Manual Link is a training     │
-- │  event. This is the "gym" for the model.                 │
-- └──────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.ai_classification_feedback (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- What document was classified
    document_id         UUID REFERENCES public.registered_agent_documents(id) ON DELETE SET NULL,
    queue_item_id       TEXT,  -- internal queue reference
    
    -- What the AI predicted
    ai_predicted_entity TEXT,       -- entity name the AI guessed
    ai_predicted_hub    TEXT,       -- hub ID the AI guessed
    ai_confidence       NUMERIC(5,2),
    ai_rules_fired      JSONB DEFAULT '[]'::jsonb,  
    -- Array of { rule_name, score, evidence }
    
    -- What the human decided
    feedback_type       TEXT NOT NULL CHECK (feedback_type IN (
        'ACCEPT',           -- AI was right, staff clicked Accept Match
        'OVERRIDE',         -- AI was wrong, staff manually linked different entity
        'MANUAL_LINK',      -- AI had no guess, staff linked from scratch
        'RECLASSIFY'        -- Staff changed the document category
    )),
    
    -- The correct answer (what staff confirmed or corrected to)
    correct_entity      TEXT,       -- the actual correct entity
    correct_hub         TEXT,       -- the actual correct hub ID
    correct_sunbiz_id   TEXT,
    correct_doc_type    TEXT,
    
    -- The raw OCR text that was used (for retraining)
    ocr_text_snapshot   TEXT,       -- first ~2000 chars of OCR output
    ocr_features        JSONB DEFAULT '{}'::jsonb,
    -- Extracted features: { entities: [], addresses: [], doc_numbers: [], keywords: [] }
    
    -- Who made the correction
    operator_id         TEXT NOT NULL,
    operator_name       TEXT,
    node_id             TEXT,       -- e.g. 'DeLand-01'
    
    -- Timing
    processing_time_ms  INTEGER,    -- how long the AI took to classify
    review_time_ms      INTEGER,    -- how long the human took to review
    
    created_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for analytics and retraining queries
CREATE INDEX IF NOT EXISTS idx_ai_feedback_type       ON public.ai_classification_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_entity     ON public.ai_classification_feedback(correct_entity);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created    ON public.ai_classification_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_operator   ON public.ai_classification_feedback(operator_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_confidence ON public.ai_classification_feedback(ai_confidence);


-- ┌──────────────────────────────────────────────────────────┐
-- │  3. AI ENTITY PATTERNS (Derived Training Data)           │
-- │  Each row = one learned pattern for an entity.           │
-- │  Populated automatically from feedback events.           │
-- └──────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.ai_entity_patterns (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id       TEXT NOT NULL,              -- links to entity record
    entity_name     TEXT NOT NULL,
    hub_id          TEXT,
    sunbiz_id       TEXT,
    
    -- Learned patterns (deduplicated from feedback)
    known_aliases           TEXT[] DEFAULT '{}',    -- alternate names seen in docs
    known_addresses         TEXT[] DEFAULT '{}',    -- addresses associated
    known_case_numbers      TEXT[] DEFAULT '{}',    -- court case numbers
    known_doc_numbers       TEXT[] DEFAULT '{}',    -- SunBiz filing numbers
    known_senders           TEXT[] DEFAULT '{}',    -- return addresses that sent to this entity
    known_doc_types         TEXT[] DEFAULT '{}',    -- document types received
    
    -- Performance for this specific entity
    total_matches           INTEGER DEFAULT 0,
    correct_matches         INTEGER DEFAULT 0,
    accuracy_pct            NUMERIC(5,2) DEFAULT 0.00,
    
    last_feedback_at        TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at              TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_entity_patterns_entity 
    ON public.ai_entity_patterns(entity_id);


-- ┌──────────────────────────────────────────────────────────┐
-- │  4. FUNCTIONS — Auto-adjust weights on feedback          │
-- └──────────────────────────────────────────────────────────┘

-- When staff submits feedback, this function adjusts rule weights.
-- ACCEPT  → boost fired rules' weights (they were right)
-- OVERRIDE/MANUAL_LINK → penalize fired rules' weights (they were wrong)
CREATE OR REPLACE FUNCTION public.adjust_ai_weights()
RETURNS TRIGGER AS $$
DECLARE
    rule RECORD;
    delta NUMERIC;
BEGIN
    -- Loop through each rule that fired for this classification
    FOR rule IN SELECT * FROM jsonb_array_elements(NEW.ai_rules_fired)
    LOOP
        IF NEW.feedback_type = 'ACCEPT' THEN
            -- Positive reinforcement: increase weight, increment correct
            UPDATE public.ai_matching_rules
            SET weight = LEAST(weight + learning_rate, 1.0000),
                times_correct = times_correct + 1,
                updated_at = now()
            WHERE rule_name = rule.value->>'rule_name';
        ELSE
            -- Negative signal: decrease weight, increment wrong
            UPDATE public.ai_matching_rules
            SET weight = GREATEST(weight - learning_rate, 0.0000),
                times_wrong = times_wrong + 1,
                updated_at = now()
            WHERE rule_name = rule.value->>'rule_name';
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_ai_feedback_adjust_weights ON public.ai_classification_feedback;
CREATE TRIGGER on_ai_feedback_adjust_weights
    AFTER INSERT ON public.ai_classification_feedback
    FOR EACH ROW EXECUTE FUNCTION public.adjust_ai_weights();


-- When feedback is an OVERRIDE or MANUAL_LINK, learn the new pattern
CREATE OR REPLACE FUNCTION public.learn_entity_pattern()
RETURNS TRIGGER AS $$
BEGIN
    -- Upsert entity patterns with new learned data
    INSERT INTO public.ai_entity_patterns (
        entity_id, entity_name, hub_id, sunbiz_id,
        total_matches, correct_matches, last_feedback_at
    ) VALUES (
        COALESCE(NEW.correct_entity, 'unknown'),
        COALESCE(NEW.correct_entity, 'unknown'),
        NEW.correct_hub,
        NEW.correct_sunbiz_id,
        1,
        CASE WHEN NEW.feedback_type = 'ACCEPT' THEN 1 ELSE 0 END,
        now()
    )
    ON CONFLICT (entity_id) DO UPDATE SET
        total_matches = ai_entity_patterns.total_matches + 1,
        correct_matches = ai_entity_patterns.correct_matches + 
            CASE WHEN NEW.feedback_type = 'ACCEPT' THEN 1 ELSE 0 END,
        accuracy_pct = ROUND(
            (ai_entity_patterns.correct_matches + 
                CASE WHEN NEW.feedback_type = 'ACCEPT' THEN 1 ELSE 0 END
            )::NUMERIC / 
            (ai_entity_patterns.total_matches + 1)::NUMERIC * 100, 
        2),
        last_feedback_at = now(),
        updated_at = now();
    
    -- If there's OCR feature data, append to known patterns
    IF NEW.ocr_features IS NOT NULL AND NEW.correct_entity IS NOT NULL THEN
        -- Learn doc numbers
        IF NEW.correct_sunbiz_id IS NOT NULL THEN
            UPDATE public.ai_entity_patterns
            SET known_doc_numbers = array_append(
                    CASE WHEN NOT (NEW.correct_sunbiz_id = ANY(known_doc_numbers))
                         THEN known_doc_numbers 
                         ELSE known_doc_numbers END,
                    NEW.correct_sunbiz_id
                )
            WHERE entity_id = NEW.correct_entity
              AND NOT (NEW.correct_sunbiz_id = ANY(known_doc_numbers));
        END IF;
        
        -- Learn doc types
        IF NEW.correct_doc_type IS NOT NULL THEN
            UPDATE public.ai_entity_patterns
            SET known_doc_types = array_append(
                    CASE WHEN NOT (NEW.correct_doc_type = ANY(known_doc_types))
                         THEN known_doc_types 
                         ELSE known_doc_types END,
                    NEW.correct_doc_type
                )
            WHERE entity_id = NEW.correct_entity
              AND NOT (NEW.correct_doc_type = ANY(known_doc_types));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_ai_feedback_learn_pattern ON public.ai_classification_feedback;
CREATE TRIGGER on_ai_feedback_learn_pattern
    AFTER INSERT ON public.ai_classification_feedback
    FOR EACH ROW EXECUTE FUNCTION public.learn_entity_pattern();


-- ┌──────────────────────────────────────────────────────────┐
-- │  5. ANALYTICS VIEW — AI Performance Dashboard            │
-- └──────────────────────────────────────────────────────────┘

CREATE OR REPLACE VIEW public.ai_classification_stats AS
SELECT
    COUNT(*) AS total_classifications,
    COUNT(*) FILTER (WHERE feedback_type = 'ACCEPT') AS auto_accepted,
    COUNT(*) FILTER (WHERE feedback_type = 'OVERRIDE') AS overridden,
    COUNT(*) FILTER (WHERE feedback_type = 'MANUAL_LINK') AS manual_links,
    ROUND(
        COUNT(*) FILTER (WHERE feedback_type = 'ACCEPT')::NUMERIC / 
        GREATEST(COUNT(*), 1)::NUMERIC * 100, 
    1) AS accuracy_pct,
    ROUND(AVG(ai_confidence), 1) AS avg_confidence,
    ROUND(AVG(review_time_ms) / 1000.0, 1) AS avg_review_seconds,
    -- Trend: last 7 days accuracy
    ROUND(
        COUNT(*) FILTER (WHERE feedback_type = 'ACCEPT' AND created_at > now() - interval '7 days')::NUMERIC /
        GREATEST(COUNT(*) FILTER (WHERE created_at > now() - interval '7 days'), 1)::NUMERIC * 100,
    1) AS accuracy_7d_pct,
    -- Trend: last 30 days accuracy
    ROUND(
        COUNT(*) FILTER (WHERE feedback_type = 'ACCEPT' AND created_at > now() - interval '30 days')::NUMERIC /
        GREATEST(COUNT(*) FILTER (WHERE created_at > now() - interval '30 days'), 1)::NUMERIC * 100,
    1) AS accuracy_30d_pct
FROM public.ai_classification_feedback;


-- ┌──────────────────────────────────────────────────────────┐
-- │  6. RLS POLICIES                                         │
-- └──────────────────────────────────────────────────────────┘

ALTER TABLE public.ai_classification_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_matching_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_entity_patterns ENABLE ROW LEVEL SECURITY;

-- Feedback: staff can insert (via edge function), admins can read
DROP POLICY IF EXISTS "Service role manages feedback" ON public.ai_classification_feedback;
CREATE POLICY "Service role manages feedback" ON public.ai_classification_feedback
    FOR ALL USING (true); -- Service role only in practice

-- Matching rules: readable by authenticated users (transparency)
DROP POLICY IF EXISTS "Authenticated users read rules" ON public.ai_matching_rules;
CREATE POLICY "Authenticated users read rules" ON public.ai_matching_rules
    FOR SELECT TO authenticated USING (true);

-- Entity patterns: readable by authenticated users
DROP POLICY IF EXISTS "Authenticated users read patterns" ON public.ai_entity_patterns;
CREATE POLICY "Authenticated users read patterns" ON public.ai_entity_patterns
    FOR SELECT TO authenticated USING (true);
