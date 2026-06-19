create table if not exists public.liquidation_candidates (
  chain_id integer not null default 11155111,
  address text not null,
  health_factor numeric not null,
  updated_at timestamptz not null default now(),
  primary key (chain_id, address)
);

create index if not exists liquidation_candidates_chain_hf_idx
  on public.liquidation_candidates (chain_id, health_factor asc);