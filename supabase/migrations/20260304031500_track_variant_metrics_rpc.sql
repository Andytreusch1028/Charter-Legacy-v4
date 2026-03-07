-- 20260304031500_track_variant_metrics_rpc.sql

-- Creates Security Definer RPCs to allow unauthenticated (or anon) users to 
-- increment the views and clicks of hero variants seamlessly.

CREATE OR REPLACE FUNCTION increment_variant_view(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE hero_variants SET views = views + 1 WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_variant_click(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE hero_variants SET clicks = clicks + 1 WHERE id = p_id;
END;
$$;
