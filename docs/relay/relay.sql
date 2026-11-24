-- docs/relay/relay.sql
-- 24 Nov 2026 v1
--
-- P-45 THE PHYSIO LINK, Stage 2: the relay (spec docs/specs/alongside_physio-live-link_24nov2026_v1.md).
-- Run once in a new Supabase project (Frankfurt, eu-central-1), in the SQL editor,
-- as the project owner. Safe to run again.
--
-- What it holds: for each live link, a random id, a hash of the phone's own secret
-- (so only that phone can close it), when it opened and when it ends (90 days).
-- For each message from a physio or trainer: the channel, a number, and the changes
-- ENCRYPTED on their browser with a key that never reaches this database (it lives
-- after the # in the link). Nothing here can be read by Build New Habits.
--
-- Nobody can read or write the tables directly: row level security is on with no
-- policies, and every grant is taken away. The app and the page can only call the
-- five functions below, each of which checks what it is given.
--   relay_open(channel, owner_hash)     the phone opens a live link
--   relay_post(channel, iv, body)       the page sends one sealed message
--   relay_fetch(channel, after)         the phone collects new messages (20 at most)
--   relay_ack(channel, owner, upto)     the phone has them: they are deleted here
--   relay_close(channel, owner)         the phone stops the live link: all of it deleted
-- relay_clean() deletes ended links and any message older than 30 days; schedule it
-- daily (step 3 at the bottom).

create table if not exists public.relay_channels (
  id          uuid primary key,
  owner_hash  text not null check (owner_hash ~ '^[0-9a-f]{64}$'),
  opened_at   timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '90 days',
  posts       integer not null default 0
);

create table if not exists public.relay_messages (
  id          bigint generated always as identity primary key,
  channel     uuid not null references public.relay_channels(id) on delete cascade,
  iv          text not null check (iv ~ '^[A-Za-z0-9_-]{16}$'),
  body        text not null check (length(body) between 16 and 30000 and body ~ '^[A-Za-z0-9_-]+$'),
  created_at  timestamptz not null default now()
);
create index if not exists relay_messages_channel_id on public.relay_messages (channel, id);

alter table public.relay_channels enable row level security;
alter table public.relay_messages enable row level security;
revoke all on public.relay_channels from public;
revoke all on public.relay_messages from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.relay_channels, public.relay_messages from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on public.relay_channels, public.relay_messages from authenticated';
  end if;
end $$;

-- The phone opens a live link. False if the id is taken. At most 2,000 opened in an
-- hour across everyone, so the table cannot be flooded.
create or replace function public.relay_open(p_channel uuid, p_owner_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_channel is null or p_owner_hash is null or p_owner_hash !~ '^[0-9a-f]{64}$' then return false; end if;
  if (select count(*) from relay_channels where opened_at > now() - interval '1 hour') >= 2000 then return false; end if;
  insert into relay_channels (id, owner_hash) values (p_channel, p_owner_hash);
  return true;
exception when unique_violation then
  return false;
end $$;

-- The page sends one sealed message. Null if the link has ended, is unknown, or has
-- had 50 messages already.
create or replace function public.relay_post(p_channel uuid, p_iv text, p_body text)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  if p_iv is null or p_body is null or p_iv !~ '^[A-Za-z0-9_-]{16}$'
     or length(p_body) not between 16 and 30000 or p_body !~ '^[A-Za-z0-9_-]+$' then return null; end if;
  update relay_channels set posts = posts + 1
    where id = p_channel and expires_at > now() and posts < 50;
  if not found then return null; end if;
  insert into relay_messages (channel, iv, body) values (p_channel, p_iv, p_body) returning id into v_id;
  return v_id;
end $$;

-- The phone collects what has come since the last one it has.
create or replace function public.relay_fetch(p_channel uuid, p_after bigint)
returns table (id bigint, iv text, body text, created_at timestamptz)
language sql security definer set search_path = public stable as $$
  select m.id, m.iv, m.body, m.created_at
  from relay_messages m join relay_channels c on c.id = m.channel
  where m.channel = p_channel and c.expires_at > now() and m.id > coalesce(p_after, 0)
  order by m.id limit 20;
$$;

-- The phone has them: they are deleted here. Only the phone that opened it (its secret).
create or replace function public.relay_ack(p_channel uuid, p_owner text, p_upto bigint)
returns integer language plpgsql security definer set search_path = public as $$
declare v_n integer;
begin
  if not exists (select 1 from relay_channels where id = p_channel
                 and owner_hash = encode(sha256(convert_to(coalesce(p_owner, ''), 'UTF8')), 'hex')) then return 0; end if;
  delete from relay_messages where channel = p_channel and id <= p_upto;
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- The phone stops the live link: the link and every message on it are deleted.
create or replace function public.relay_close(p_channel uuid, p_owner text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from relay_channels where id = p_channel
    and owner_hash = encode(sha256(convert_to(coalesce(p_owner, ''), 'UTF8')), 'hex');
  return found;
end $$;

-- Daily: ended links (with their messages), and any message left 30 days.
create or replace function public.relay_clean()
returns integer language plpgsql security definer set search_path = public as $$
declare a integer; b integer;
begin
  delete from relay_channels where expires_at <= now();
  get diagnostics a = row_count;
  delete from relay_messages where created_at <= now() - interval '30 days';
  get diagnostics b = row_count;
  return a + b;
end $$;

revoke all on function public.relay_open(uuid, text), public.relay_post(uuid, text, text),
  public.relay_fetch(uuid, bigint), public.relay_ack(uuid, text, bigint),
  public.relay_close(uuid, text), public.relay_clean() from public;
-- Supabase grants every new function to anon and authenticated by default, so
-- revoking from public is not enough: take them away by name, then give anon the five.
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on function public.relay_open(uuid, text), public.relay_post(uuid, text, text),
      public.relay_fetch(uuid, bigint), public.relay_ack(uuid, text, bigint), public.relay_close(uuid, text),
      public.relay_clean() from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.relay_open(uuid, text), public.relay_post(uuid, text, text),
      public.relay_fetch(uuid, bigint), public.relay_ack(uuid, text, bigint), public.relay_close(uuid, text),
      public.relay_clean() from authenticated';
  end if;
end $$;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'grant execute on function public.relay_open(uuid, text), public.relay_post(uuid, text, text),
      public.relay_fetch(uuid, bigint), public.relay_ack(uuid, text, bigint), public.relay_close(uuid, text) to anon';
  end if;
end $$;

-- Step 3 (once): Database > Extensions > enable pg_cron, then run:
--   select cron.schedule('relay-clean', '17 3 * * *', 'select public.relay_clean()');
