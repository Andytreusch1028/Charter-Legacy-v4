-- MASTER RECONSTRUCTION: Charter Legacy v5.6
-- COPY ALL VALID SQL BELOW AND PASTE INTO SUPABASE DASHBOARD -> SQL EDITOR

-- 1. PROFILES (Security Context)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    user_type TEXT CHECK (user_type IN ('llc', 'will')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LLCS (The Sovereign Ledger Core)
CREATE TABLE IF NOT EXISTS llcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    product_type TEXT, 
    llc_name TEXT NOT NULL,
    llc_status TEXT DEFAULT 'active',
    privacy_shield_active BOOLEAN DEFAULT true,
    next_deadline DATE,
    deadline_type TEXT,
    -- Automation Columns
    principal_address TEXT,
    statutory_purpose TEXT,
    organizer_name TEXT,
    is_professional BOOLEAN DEFAULT false,
    filing_status TEXT DEFAULT 'PENDING', 
    tracking_number TEXT,
    filed_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WILLS (Legacy Context)
CREATE TABLE IF NOT EXISTS wills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    will_status TEXT DEFAULT 'executed',
    executed_date DATE,
    legacy_timer_active BOOLEAN DEFAULT true,
    last_checkin TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    successor_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ALERTS & LEDGER
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    llc_id UUID REFERENCES llcs(id),
    error TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    recipient TEXT,
    status TEXT,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE llcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- 6. SECURITY POLICIES
-- Profiles
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- LLCs
DO $$ BEGIN
    CREATE POLICY "Users can view own LLCs" ON llcs FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Wills
DO $$ BEGIN
    CREATE POLICY "Users can view own wills" ON wills FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Alerts & Ledger
DO $$ BEGIN
    CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (auth.uid() IN (SELECT user_id FROM llcs WHERE id = llc_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own ledger" ON ledger_entries FOR SELECT USING (auth.uid() IN (SELECT user_id FROM llcs WHERE id = entity_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (new.id, '', '');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
