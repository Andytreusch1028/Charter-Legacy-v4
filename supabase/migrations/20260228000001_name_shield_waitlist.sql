-- ─────────────────────────────────────────────────────────────────────────────
-- NAME SHIELD WAITLIST
-- Captures early-access signups before the product is live.
-- Insert-only from the landing page (anon role).
-- Only service_role can read or export the list.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.name_shield_waitlist (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  signed_up_at  timestamptz not null default now(),
  source        text default 'landing_page',
  notified_at   timestamptz,          -- set when launch email is sent
  converted_at  timestamptz,          -- set when they purchase after launch

  constraint name_shield_waitlist_email_unique unique (email)
);

-- Row Level Security
alter table public.name_shield_waitlist enable row level security;

-- Anon users can insert (sign up)
DROP POLICY IF EXISTS "Allow anon waitlist insert" ON public.name_shield_waitlist;
create policy "Allow anon waitlist insert"
  on public.name_shield_waitlist
  for insert
  to anon
  with check (true);

-- Only service_role (admin) can read — never expose email list publicly
DROP POLICY IF EXISTS "Service role can read waitlist" ON public.name_shield_waitlist;
create policy "Service role can read waitlist"
  on public.name_shield_waitlist
  for select
  to service_role
  using (true);
