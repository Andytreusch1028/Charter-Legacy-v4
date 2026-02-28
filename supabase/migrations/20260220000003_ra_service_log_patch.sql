-- Migration Patch: Add file_path to ra_service_log
ALTER TABLE public.ra_service_log 
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Verify RLS ensures staff can see the new column
-- (Column-level security is not explicitly used, so RLS on table is sufficient)
