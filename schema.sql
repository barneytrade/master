create table public.tr_company (
 id text primary key check(id='smith-plumbing'), name text not null,
 services text not null, coverage text not null, hours text not null,
 updated_at timestamptz not null default now()
);
insert into public.tr_company(id,name,services,coverage,hours) values
 ('smith-plumbing','Smith Plumbing','Leaks, drains and taps','Wimbledon, Putney and Wandsworth','Monday–Friday, 08:00–18:00 (London)');
create table public.tr_leads (
 id uuid primary key default gen_random_uuid(), company_id text not null default 'smith-plumbing' references public.tr_company(id),
 created_at timestamptz not null default now(), name text not null, phone text not null default '', postcode text not null default '',
 summary text not null, urgency text not null default 'routine' check(urgency in ('routine','urgent')),
 callback_time text not null default '', source text not null check(source in ('test','voice')),
 status text not null default 'new' check(status in ('new','contacted','closed')),
 external_id text, raw_event jsonb,
 unique(source,external_id)
);
create index tr_leads_created on public.tr_leads(created_at desc);
create table public.tr_access (kind text primary key, token_hash text not null);
alter table public.tr_company enable row level security;
alter table public.tr_leads enable row level security;
alter table public.tr_access enable row level security;
revoke all on public.tr_company, public.tr_leads, public.tr_access from anon, authenticated;
grant all on public.tr_company, public.tr_leads, public.tr_access to service_role;
