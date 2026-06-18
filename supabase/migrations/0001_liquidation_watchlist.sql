create table if not exists public.liquidation_watchlist (
  chain_id integer not null default 11155111,
  address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (chain_id, address)
);

create index if not exists liquidation_watchlist_chain_updated_idx
  on public.liquidation_watchlist (chain_id, updated_at desc);

alter table public.liquidation_watchlist enable row level security;