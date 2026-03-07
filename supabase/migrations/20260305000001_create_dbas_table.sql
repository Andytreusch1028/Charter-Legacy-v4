-- Create the dbas table to track Fictitious Name Registrations
CREATE TABLE IF NOT EXISTS dbas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    llc_id UUID REFERENCES llcs(id) ON DELETE SET NULL,
    dba_name TEXT NOT NULL,
    purpose TEXT,
    advertising_county TEXT,
    status TEXT DEFAULT 'Pending Intake',
    payment_status TEXT DEFAULT 'Unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE dbas ENABLE ROW LEVEL SECURITY;

-- Policies for Authenticated Users
CREATE POLICY "Users can view their own DBAs"
    ON dbas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DBAs"
    ON dbas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DBAs"
    ON dbas FOR UPDATE
    USING (auth.uid() = user_id);

-- Staff (Fulfillment/Executive) bypass policies for all access
CREATE POLICY "Staff can view all DBAs"
    ON dbas FOR SELECT
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('executive', 'fulfillment')
    );

CREATE POLICY "Staff can update all DBAs"
    ON dbas FOR UPDATE
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('executive', 'fulfillment')
    );

CREATE POLICY "Staff can insert all DBAs"
    ON dbas FOR INSERT
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('executive', 'fulfillment')
    );
