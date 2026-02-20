-- Registered Agent Documents Table
CREATE TABLE IF NOT EXISTS public.registered_agent_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('State Requirement', 'Legal Notice', 'Bureaucracy')),
    viewed BOOLEAN DEFAULT false,
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Registered Agent Messages Table
CREATE TABLE IF NOT EXISTS public.registered_agent_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.registered_agent_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_agent_messages ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own documents" ON public.registered_agent_documents;
CREATE POLICY "Users can view own documents"
    ON public.registered_agent_documents FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own messages" ON public.registered_agent_messages;
CREATE POLICY "Users can view own messages"
    ON public.registered_agent_messages FOR SELECT
    USING (auth.uid() = user_id);

-- Insert Default Data Function (for new users)
CREATE OR REPLACE FUNCTION public.seed_registered_agent_content()
RETURNS TRIGGER AS $$
BEGIN
    -- Seed Documents
    INSERT INTO public.registered_agent_documents (user_id, title, date, type, viewed)
    VALUES 
    (NEW.id, 'Notice of Annual Filing', CURRENT_DATE - INTERVAL '2 days', 'State Requirement', false),
    (NEW.id, 'Service of Process (Mock)', CURRENT_DATE - INTERVAL '5 days', 'Legal Notice', true),
    (NEW.id, 'Information Request', CURRENT_DATE - INTERVAL '9 days', 'Bureaucracy', true);

    -- Seed Messages
    INSERT INTO public.registered_agent_messages (user_id, sender_name, sender_role, content, timestamp, read)
    VALUES
    (NEW.id, 'Sarah J.', 'Legal Liaison', 'We have received your annual report filing notice. No action is required yet, just a heads up.', NOW() - INTERVAL '2 hours', false),
    (NEW.id, 'Mike T.', 'Privacy Officer', 'Data Broker Shield has successfully scrubbed your info from Whitepages.com.', NOW() - INTERVAL '1 day', true);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to seed content on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_content ON auth.users;
CREATE TRIGGER on_auth_user_created_content
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.seed_registered_agent_content();
