-- epic_7_seo_telemetry.sql

-- Telemetry for A/B testing SEO variations
CREATE TABLE IF NOT EXISTS seo_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route TEXT NOT NULL,
    variation TEXT NOT NULL CHECK (variation IN ('A', 'B')),
    views INTEGER NOT NULL DEFAULT 0,
    ctr NUMERIC NOT NULL DEFAULT 0.00,
    bounce_rate NUMERIC NOT NULL DEFAULT 0.00,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (route, variation, recorded_date)
);

-- Version control / audit log for AI's autonomous changes
CREATE TABLE IF NOT EXISTS ai_optimization_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route TEXT NOT NULL,
    previous_json_payload JSONB NOT NULL,
    new_json_payload JSONB NOT NULL,
    ai_rationale TEXT, -- The AI's justification for the change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE seo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_optimization_log ENABLE ROW LEVEL SECURITY;

-- Analytics can be read by admins and written to by the frontend (anonymously)
CREATE POLICY "Public can insert analytics (increment views)"
    ON seo_analytics FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can update analytics views"
    ON seo_analytics FOR UPDATE
    USING (true);

CREATE POLICY "Admins can read analytics"
    ON seo_analytics FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'ra_agent'));

-- Optimization Logs are strictly internal Admin only
CREATE POLICY "Admins can read optimization logs"
    ON ai_optimization_log FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'ra_agent'));

CREATE POLICY "Admins can insert optimization logs"
    ON ai_optimization_log FOR INSERT
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'ra_agent'));

-- RPC for atomic upsert of page views
CREATE OR REPLACE FUNCTION increment_page_view(p_route TEXT, p_variation TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO seo_analytics (route, variation, views, recorded_date)
    VALUES (p_route, p_variation, 1, CURRENT_DATE)
    ON CONFLICT (route, variation, recorded_date)
    DO UPDATE SET views = seo_analytics.views + 1;
END;
$$;
