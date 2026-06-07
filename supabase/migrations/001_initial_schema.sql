create extension if not exists "pgcrypto";

create table public.trello_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  trello_member_id text not null,
  username text,
  full_name text,
  encrypted_token text not null,
  token_nonce text not null,
  token_tag text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  trello_board_id text not null unique,
  name text not null,
  url text,
  target_date date,
  last_synced_at timestamptz,
  last_sync_status text not null default 'idle' check (last_sync_status in ('idle', 'syncing', 'ok', 'error')),
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.board_memberships (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create table public.trello_cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  trello_card_id text not null,
  name text not null,
  url text,
  list_id text,
  closed boolean not null default false,
  pos double precision,
  total_check_items integer not null default 0,
  completed_check_items integer not null default 0,
  remaining_check_items integer not null default 0,
  percent_complete integer not null default 0,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (board_id, trello_card_id)
);

create table public.board_snapshots (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  captured_at timestamptz not null default now(),
  total_check_items integer not null,
  completed_check_items integer not null,
  remaining_check_items integer not null
);

create table public.card_snapshots (
  id uuid primary key default gen_random_uuid(),
  board_snapshot_id uuid not null references public.board_snapshots(id) on delete cascade,
  board_id uuid not null references public.boards(id) on delete cascade,
  card_id uuid not null references public.trello_cards(id) on delete cascade,
  captured_at timestamptz not null default now(),
  total_check_items integer not null,
  completed_check_items integer not null,
  remaining_check_items integer not null,
  percent_complete integer not null
);

create index board_memberships_user_id_idx on public.board_memberships(user_id);
create index boards_trello_board_id_idx on public.boards(trello_board_id);
create index trello_cards_board_id_idx on public.trello_cards(board_id);
create index board_snapshots_board_id_captured_at_idx on public.board_snapshots(board_id, captured_at);
create index card_snapshots_board_id_captured_at_idx on public.card_snapshots(board_id, captured_at);

alter table public.trello_accounts enable row level security;
alter table public.boards enable row level security;
alter table public.board_memberships enable row level security;
alter table public.trello_cards enable row level security;
alter table public.board_snapshots enable row level security;
alter table public.card_snapshots enable row level security;

create policy "Users can read their own Trello account"
  on public.trello_accounts for select
  using (auth.uid() = user_id);

create policy "Users can manage their own Trello account"
  on public.trello_accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read boards they belong to"
  on public.boards for select
  using (
    exists (
      select 1 from public.board_memberships
      where board_memberships.board_id = boards.id
      and board_memberships.user_id = auth.uid()
    )
  );

create policy "Users can update boards they belong to"
  on public.boards for update
  using (
    exists (
      select 1 from public.board_memberships
      where board_memberships.board_id = boards.id
      and board_memberships.user_id = auth.uid()
    )
  );

create policy "Users can read their board memberships"
  on public.board_memberships for select
  using (auth.uid() = user_id);

create policy "Users can read cards on boards they belong to"
  on public.trello_cards for select
  using (
    exists (
      select 1 from public.board_memberships
      where board_memberships.board_id = trello_cards.board_id
      and board_memberships.user_id = auth.uid()
    )
  );

create policy "Users can read board snapshots on boards they belong to"
  on public.board_snapshots for select
  using (
    exists (
      select 1 from public.board_memberships
      where board_memberships.board_id = board_snapshots.board_id
      and board_memberships.user_id = auth.uid()
    )
  );

create policy "Users can read card snapshots on boards they belong to"
  on public.card_snapshots for select
  using (
    exists (
      select 1 from public.board_memberships
      where board_memberships.board_id = card_snapshots.board_id
      and board_memberships.user_id = auth.uid()
    )
  );
