-- 20260304030000_insert_pending_variants_rpc_v2.sql

-- Updates the Security Definer RPC so the AIGrowthConsole can insert new pending variants.
-- V2 Enhancement: Automatically purges any older PENDING variants before inserting the 
-- fresh batch, converting the system from an accumulating queue to a "latest batch only" model 
-- to prevent the user from being overwhelmed by orphaned rows.

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
        INSERT INTO hero_variants (variant_code, headline, subheading, target_sentiment, status)
        VALUES (
            v_record->>'variant_code',
            v_record->>'headline',
            v_record->>'subheading',
            v_record->>'target_sentiment',
            'PENDING'
        );
    END LOOP;
END;
$$;
