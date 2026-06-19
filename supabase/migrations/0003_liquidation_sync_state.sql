create table if not exists public.liquidation_sync_state (
  chain_id integer primary key,
  last_scanned_block bigint not null default 0,
  updated_at timestamptz not null default now()
);