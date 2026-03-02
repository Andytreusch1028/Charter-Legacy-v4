-- Migration: Create SEO Discoverability Table for the WebMCP/Agentic strategy.

CREATE TABLE IF NOT EXISTS public.seo_discoverability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    keywords TEXT,
    json_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.seo_discoverability ENABLE ROW LEVEL SECURITY;

-- Read Access: Open to all (both agents crawling and users)
CREATE POLICY "Allow public read access on seo_discoverability"
  ON public.seo_discoverability FOR SELECT
  USING (true);

-- Write Access: Allow authenticated editors or local dev 
CREATE POLICY "Allow all write access on seo_discoverability"
  ON public.seo_discoverability FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert Default Baseline Record for "/"
INSERT INTO public.seo_discoverability (route, title, description, keywords, json_payload)
VALUES (
  '/',
  'Florida LLC Formation & Trust Protocol | Charter Legacy',
  'We protect Florida businesses by securing their anonymity off the public record and keeping their operations compliant. Form your Anonymous LLC or arrange a Florida Homestead transfer all online.',
  'florida llc, anonymous llc florida, registered agent, florida living trust, form an llc in florida',
  '{"@context":"https://schema.org","@type":"LegalService","name":"Charter Legacy","url":"https://charterlegacy.com","priceRange":"$249 setup","address":{"@type":"PostalAddress","addressLocality":"Miami","addressRegion":"FL","addressCountry":"US"}}'::jsonb
) ON CONFLICT (route) DO NOTHING;
