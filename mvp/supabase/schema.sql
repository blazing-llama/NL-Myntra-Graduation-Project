-- Event log for the MVP's interaction telemetry.
-- Run this once in the Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query)
-- after creating the project. No Supabase CLI needed.
--
-- Wired live as of 2026-08-25. If you're re-running this after the table
-- already exists, run at least the GRANT statement below -- an earlier
-- version of this file was missing it, causing every insert to fail with
-- "permission denied for table event_log" (401) despite the RLS policy
-- being correct. RLS policies restrict *which* rows a role can touch; the
-- role still needs the base table-level privilege granted separately.
-- See docs/FAILURES.md, 2026-08-25.

create table if not exists public.event_log (
  id bigint generated always as identity primary key,
  item_id text not null,
  event_type text not null check (event_type in ('add_to_cart', 'buy_now', 'trace_expand', 'badge_tap')),
  persona_id text not null,
  created_at timestamptz not null default now()
);

-- Phase 4 (docs/PHASE_PLAN.md, 2026-08-28): added the buy_now event type so
-- Buy Now can be measured distinctly from Add to Cart. `create table if not
-- exists` above does NOT retroactively widen a CHECK constraint on a table
-- that already exists live -- run this against the already-deployed table:
alter table public.event_log drop constraint if exists event_log_event_type_check;
alter table public.event_log add constraint event_log_event_type_check
  check (event_type in ('add_to_cart', 'buy_now', 'trace_expand', 'badge_tap'));

create index if not exists event_log_item_id_idx on public.event_log (item_id);
create index if not exists event_log_event_type_idx on public.event_log (event_type);

-- Row Level Security: the anon key is designed to be public (unlike the
-- Groq API key, which must never appear client-side -- see requirement #11
-- in 01_MVP_DESIGN_SPEC.md). RLS is what actually secures it: anon may only
-- INSERT (write-only telemetry), never SELECT/UPDATE/DELETE.
alter table public.event_log enable row level security;

create policy "anon can insert events"
  on public.event_log
  for insert
  to anon
  with check (true);

-- The RLS policy above only restricts which rows anon may touch -- it does
-- NOT grant the base SQL-level privilege. Postgres requires both, or every
-- insert fails with "permission denied for table", a different error from
-- an RLS rejection ("new row violates row-level security policy").
grant insert on public.event_log to anon;
grant usage on sequence public.event_log_id_seq to anon;

-- Deliberately no SELECT policy for anon -- the demo has no need to read
-- events back client-side, and this keeps logged data from being publicly
-- readable via the anon key.
