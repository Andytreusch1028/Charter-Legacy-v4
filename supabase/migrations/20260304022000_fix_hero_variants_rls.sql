-- 20260304022000_fix_hero_variants_rls.sql

-- Creates a Security Definer RPC so the AIGrowthConsole can update variant statuses 
-- even when the developer is bypassing the staff login (and lacks a valid JWT).

CREATE OR REPLACE FUNCTION update_hero_variant_status(p_id UUID, p_status TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE hero_variants 
    SET status = p_status 
    WHERE id = p_id;
END;
$$;
