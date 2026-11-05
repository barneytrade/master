alter table public.tr_company
 add column setup_revision uuid not null default gen_random_uuid(),
 add column setup_status text not null default 'pending' check (setup_status in ('pending','setting_up','ready','needs_attention')),
 add column setup_note text not null default 'Waiting for the setup agent.',
 add column setup_verified_at timestamptz;
