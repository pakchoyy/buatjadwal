create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  amount integer not null,
  qris_url text not null,
  mayar_qris_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled')),
  export_type text not null,
  export_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  expires_at timestamptz not null,
  ip_address text
);

create index if not exists payment_transactions_status_idx on public.payment_transactions (status);
create index if not exists payment_transactions_created_at_idx on public.payment_transactions (created_at);
create index if not exists payment_transactions_mayar_qris_id_idx on public.payment_transactions (mayar_qris_id);
create index if not exists payment_transactions_amount_idx on public.payment_transactions (amount);
