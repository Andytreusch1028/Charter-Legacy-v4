-- Registered Agent Configuration Table
-- Stores user preferences for the Registered Agent Console features

CREATE TABLE IF NOT EXISTS public.registered_agent_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    auto_dispose_marketing BOOLEAN DEFAULT true,
    priority_forwarding BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT false,
    sms_interrupt BOOLEAN DEFAULT false,
    data_broker_shield BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.registered_agent_config ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own config" ON public.registered_agent_config;
CREATE POLICY "Users can view own config"
    ON public.registered_agent_config FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own config" ON public.registered_agent_config;
CREATE POLICY "Users can update own config"
    ON public.registered_agent_config FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own config" ON public.registered_agent_config;
CREATE POLICY "Users can insert own config"
    ON public.registered_agent_config FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_config_updated ON public.registered_agent_config;
CREATE TRIGGER on_config_updated
    BEFORE UPDATE ON public.registered_agent_config
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
