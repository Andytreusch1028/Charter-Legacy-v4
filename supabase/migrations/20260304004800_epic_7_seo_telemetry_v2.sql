-- epic_7_seo_telemetry_v2.sql

-- Expand the seo_analytics table to track conversions and revenue (Dark Funnel Telemetry)
ALTER TABLE IF EXISTS seo_analytics 
    ADD COLUMN IF NOT EXISTS conversions INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS revenue NUMERIC NOT NULL DEFAULT 0.00;

-- RPC for securely logging downstream conversions from Stripe / Success Pages
CREATE OR REPLACE FUNCTION increment_seo_conversion(p_route TEXT, p_variation TEXT, p_revenue NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- We UPSERT based on route, variation, and date.
    -- If a view hasn't happened yet today for this variation (unlikely but possible), 
    -- we create the row with 0 views and 1 conversion.
    INSERT INTO seo_analytics (route, variation, views, conversions, revenue, recorded_date)
    VALUES (p_route, p_variation, 0, 1, p_revenue, CURRENT_DATE)
    ON CONFLICT (route, variation, recorded_date)
    DO UPDATE SET 
        conversions = seo_analytics.conversions + 1,
        revenue = seo_analytics.revenue + p_revenue;
END;
$$;
