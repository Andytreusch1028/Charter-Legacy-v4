-- Add AI integer grading metrics to hero_variants table
ALTER TABLE hero_variants
ADD COLUMN IF NOT EXISTS metric_value INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metric_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metric_usability INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metric_draw INTEGER DEFAULT 0;

-- Update the RPC to ingest these new metrics when inserting pending variants
CREATE OR REPLACE FUNCTION insert_pending_hero_variants(p_payload JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record JSONB;
BEGIN
    -- Purge any existing PENDING variants to keep the queue clean
    DELETE FROM hero_variants WHERE status = 'PENDING';

    -- Insert the new batch
    FOR v_record IN SELECT * FROM jsonb_array_elements(p_payload)
    LOOP
        INSERT INTO hero_variants (
            variant_code, 
            headline, 
            subheading, 
            target_sentiment, 
            status,
            metric_value,
            metric_score,
            metric_usability,
            metric_draw
        )
        VALUES (
            v_record->>'variant_code',
            v_record->>'headline',
            v_record->>'subheading',
            v_record->>'target_sentiment',
            'PENDING',
            COALESCE((v_record->>'metric_value')::INTEGER, 0),
            COALESCE((v_record->>'metric_score')::INTEGER, 0),
            COALESCE((v_record->>'metric_usability')::INTEGER, 0),
            COALESCE((v_record->>'metric_draw')::INTEGER, 0)
        );
    END LOOP;
END;
$$;
