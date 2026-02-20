-- ============================================================
-- STAFF ROLE PROVISIONING (Custom Claims)
-- ============================================================

-- This function allows setting a staff role in the user's JWT
-- REQUIRES: Supabase "Auth" schema access (Service Role)
-- Run this in the SQL Editor to make a user a staff member.

CREATE OR REPLACE FUNCTION public.set_staff_role(user_email TEXT, role_name TEXT)
RETURNS void AS $$
BEGIN
    UPDATE auth.users
    SET raw_app_meta_data = 
        raw_app_meta_data || 
        jsonb_build_object('staff_role', role_name)
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example Usage:
-- SELECT public.set_staff_role('YOUR_USER_UUID', 'master_admin');
-- SELECT public.set_staff_role('YOUR_USER_UUID', 'ra_agent');

-- ============================================================
-- CHINESE WALL RLS (Role-Based)
-- ============================================================

-- RA Agent: Can see RA docs and Inquiries, but BLOCKED from LLCs and Wills.
-- Formation Clerk: Can see LLCs, but BLOCKED from Inquiries and Audit logs.

-- 1. LLCs Policy
DROP POLICY IF EXISTS "Staff can view LLCs" ON public.llcs;
CREATE POLICY "Staff can view LLCs" ON public.llcs
    FOR SELECT USING (
        (auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'formation_clerk')
    );

-- 2. Wills Policy
DROP POLICY IF EXISTS "Staff can view Wills" ON public.wills;
CREATE POLICY "Staff can view Wills" ON public.wills
    FOR SELECT USING (
        (auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'legacy_clerk')
    );

-- 3. Inquiries Policy
DROP POLICY IF EXISTS "Staff can view inquiries" ON public.ra_inquiry_threads;
CREATE POLICY "Staff can view inquiries" ON public.ra_inquiry_threads
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'ra_agent')
    );

-- 4. Inquiry Messages Policy
DROP POLICY IF EXISTS "Staff can manage inquiry messages" ON public.ra_inquiry_messages;
CREATE POLICY "Staff can manage inquiry messages" ON public.ra_inquiry_messages
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'ra_agent')
    );

-- 5. Fulfillment Events Policy
DROP POLICY IF EXISTS "Staff can manage fulfillment events" ON public.fulfillment_events;
CREATE POLICY "Staff can manage fulfillment events" ON public.fulfillment_events
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'ra_agent', 'formation_clerk', 'legacy_clerk')
    );
