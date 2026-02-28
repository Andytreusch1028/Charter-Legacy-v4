-- ============================================================
-- Clients / Entities Table
-- Stores the Ground Truth for all legal entities managed
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clients (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    sunbiz_id       TEXT,
    owner_name      TEXT,
    email           TEXT,
    status          TEXT DEFAULT 'Active',
    plan            TEXT,
    hub_id          TEXT,
    ein             TEXT,
    principal_address TEXT,
    mailing_address   TEXT,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Allow staff to read/write all (will tighten later)
DROP POLICY IF EXISTS "Staff manage clients" ON public.clients;
CREATE POLICY "Staff manage clients" ON public.clients
    FOR ALL USING (true);

-- Seed with former Mock Data
INSERT INTO public.clients (name, sunbiz_id, owner_name, email, status, plan, hub_id, principal_address)
VALUES 
('Treusch Holdings, LLC', 'L24000392044', 'Andres Treusch', 'andres@treusch.com', 'Active', 'Shield + RA', 'DL-FL-605', '123 Main St, DeLand, FL 32720'),
('Bella Rosa Boutique, LLC', 'L23000188712', 'Maria Garcia', 'maria@bellarosa.com', 'Active', 'RA Only', 'DL-FL-412', '456 Rose Lane, Ormond Beach, FL 32174'),
('Volusia Dev Group, LLC', 'L22000456331', 'James Whitfield', 'james@volusiadev.com', 'Active', 'Shield + RA', 'DL-FL-789', '789 Innovation Way, Daytona Beach, FL 32114'),
('Flagler Marine Services, LLC', 'L25000091287', 'Robert Flagler', 'rob@flaglermarine.com', 'Active', 'RA Only', 'DL-FL-233', '101 Coastal Dr, Palm Coast, FL 32137'),
('Sunrise Wellness Corp', 'P24000523891', 'Diana Lopez', 'diana@sunrisewellness.com', 'Dissolved', 'Legacy', 'DL-FL-901', '202 Sunshine Blvd, New Smyrna Beach, FL 32168'),
('Coastal Ventures, LLC', 'L25000112099', 'Mark Thompson', 'mark@coastalventures.com', 'Active', 'Shield + RA', 'DL-FL-330', '303 Atlantic Ave, Daytona Beach, FL 32118'),
('DeLand Properties Group, LLC', 'L24000887321', 'Sarah Mitchell', 'sarah@delandprop.com', 'Active', 'RA Only', 'DL-FL-445', '404 Historic Dr, DeLand, FL 32724'),
('Ormond Beach Dental, PA', 'P23000344521', 'Dr. Kevin Patel', 'kpatel@ormondbeachdental.com', 'Active', 'Shield + RA', 'DL-FL-662', '505 Medical Plaza, Ormond Beach, FL 32174')
ON CONFLICT (name) DO NOTHING;
