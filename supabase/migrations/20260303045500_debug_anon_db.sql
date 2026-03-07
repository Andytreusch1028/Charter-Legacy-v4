-- Similar to the storage bucket, the Dev Bypass frontend uses the anon key 
-- to perform actions since a real Supabase session is not established.
-- We must grant public/anon access to the ra_service_log table for these requests to succeed.

-- Grant INSERT to anyone so the dev bypass can post logs
CREATE POLICY "Allow public insert to service log for dev bypass"
ON public.ra_service_log FOR INSERT
TO public
WITH CHECK (true);

-- Grant SELECT to anyone so the dev bypass can check for duplicates
CREATE POLICY "Allow public select of service log for dev bypass"
ON public.ra_service_log FOR SELECT
TO public
USING (true);

-- Grant UPDATE to anyone so the dev bypass can progress items
CREATE POLICY "Allow public update of service log for dev bypass"
ON public.ra_service_log FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
