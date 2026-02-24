-- Epic 1: Supabase Backend Hardening
-- Run this script in the Supabase SQL Editor

-- =================================================================================
-- 1. A/B Testing & Hero Variant Tables
-- =================================================================================

-- Create hero_variants table
CREATE TABLE IF NOT EXISTS public.hero_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    variant_code TEXT NOT NULL UNIQUE, -- e.g., 'A', 'B', 'C'
    headline TEXT NOT NULL,
    subheading TEXT NOT NULL,
    target_sentiment TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'PENDING', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 3 primary variants from the Dynamic Hero Strategy
INSERT INTO public.hero_variants (variant_code, headline, subheading, target_sentiment)
VALUES 
('A', 'Start. Shield. Sustain.', 'The entire lifecycle of your business, distilled into one elegant experience. We’ve automated the filings, shielded the ownership, and secured the hand-off. It’s not just a tool—it’s the definitive way to build something that lasts.', 'Efficiency and All-in-One Utility'),
('B', 'Anonymity by Default.', 'Your life belongs to you. Your business belongs to the state. We build an invisible wall between them, housing your entity in our secure facility so your home address never sees the public eye.', 'Security, Freedom, and Anonymity'),
('C', 'Build it. Protect it. Pass it on.', 'Most entities die when the founder does. Charter Legacy pairs institutional-grade privacy with automated succession protocols, providing the administrative framework so your life’s work transfers exactly as you designed.', 'Emotional Security and Continuity')
ON CONFLICT (variant_code) DO NOTHING;

-- Create campaign_analytics table
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    variant_id UUID REFERENCES public.hero_variants(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('IMPRESSION', 'CLICK', 'CONVERSION')),
    session_id TEXT, -- Optional identifier for unique session tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================================
-- 2. Staff Operations & Audit Logs
-- =================================================================================

-- Create audit_logs table for Staff Actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_uuid UUID NOT NULL, -- The staff member performing the action
    action_type TEXT NOT NULL, -- e.g., 'VIEW_LLC', 'APPROVE_VARIANT', 'PROCESS_BOI'
    target_resource_id TEXT, -- e.g., the llc_id or variant_id
    details JSONB, -- Payload containing exact changes or context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================================
-- 3. Row Level Security (RLS) Lockdown for LLCs Table
-- =================================================================================

-- Ensure RLS is enabled on the llcs table
ALTER TABLE public.llcs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can perfectly SELECT their own LLCs
DROP POLICY IF EXISTS "Users can view their own LLCs" ON public.llcs;
CREATE POLICY "Users can view their own LLCs" 
ON public.llcs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can INSERT an LLC only if the user_id matches their own auth ID
DROP POLICY IF EXISTS "Users can insert their own LLCs" ON public.llcs;
CREATE POLICY "Users can insert their own LLCs" 
ON public.llcs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE only their own LLCs
DROP POLICY IF EXISTS "Users can update their own LLCs" ON public.llcs;
CREATE POLICY "Users can update their own LLCs" 
ON public.llcs 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: Staff Override/Fulfillment Console data fetching should occur via edge functions 
-- using the Supabase Service Role key, which securely bypasses these client-side RLS rules.
