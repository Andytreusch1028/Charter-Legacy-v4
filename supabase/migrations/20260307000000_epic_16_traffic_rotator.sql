-- epic_16_traffic_rotator.sql

-- Creates the engine for the Smart A/B Rotator
-- Instead of splitting 50/50 blindly, it looks at the historical revenue tied to
-- Variation A vs Variation B for the specific route, and returns the winner.

CREATE OR REPLACE FUNCTION get_winning_seo_variation(p_route TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rev_a NUMERIC;
    v_rev_b NUMERIC;
    v_winner TEXT;
BEGIN
    -- 1. Grab Total Revenue for Variation A on this exact route
    SELECT COALESCE(SUM(revenue), 0) INTO v_rev_a
    FROM seo_analytics
    WHERE route = p_route AND variation = 'A';

    -- 2. Grab Total Revenue for Variation B on this exact route
    SELECT COALESCE(SUM(revenue), 0) INTO v_rev_b
    FROM seo_analytics
    WHERE route = p_route AND variation = 'B';

    -- 3. The Logic matrix:
    -- If revenues are perfectly tied (usually 0.00 right after deployment), flip a 50/50 coin.
    IF v_rev_a = v_rev_b THEN
        IF random() < 0.5 THEN
            v_winner := 'A';
        ELSE
            v_winner := 'B';
        END IF;
    -- If A generated more money, A wins the traffic routing
    ELSIF v_rev_a > v_rev_b THEN
        v_winner := 'A';
    -- Otherwise, B generated more money, B wins
    ELSE
        v_winner := 'B';
    END IF;

    RETURN v_winner;
END;
$$;
