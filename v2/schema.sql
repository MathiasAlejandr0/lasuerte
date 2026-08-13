-- =============================================================================
-- Suertu2s — Esquema SQL Completo para Supabase
--
-- INSTRUCCIONES PARA EJECUTAR EN SUPABASE:
-- 1. En Supabase Dashboard -> SQL Editor -> New Query.
-- 2. Copia y pega TODO este contenido y haz clic en RUN.
-- 3. Luego en Project Settings -> API obtén:
--      - NEXT_PUBLIC_SUPABASE_URL
--      - NEXT_PUBLIC_SUPABASE_ANON_KEY
--      - SUPABASE_SERVICE_ROLE_KEY
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Sorteo y packs
-- -----------------------------------------------------------------------------
create table if not exists public.raffles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prize_name text not null,
  ends_at timestamptz not null,
  status text not null default 'active'
    check (status in ('active', 'closed', 'draft')),
  code text not null unique
    check (code ~ '^[A-Z0-9]{2,12}$'),
  ticket_min int not null default 0,
  ticket_max int not null default 99999,
  created_at timestamptz not null default now()
);

create table if not exists public.packs (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  price_clp int not null,
  ticket_count int not null,
  image_url text not null,
  illustration_urls jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. Afiliados
-- -----------------------------------------------------------------------------
create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  email text,
  phone text,
  commission_type text not null default 'percent'
    check (commission_type in ('percent', 'fixed')),
  commission_value numeric(12, 2) not null default 10,
  active boolean not null default true,
  notes text,
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliates_code_idx on public.affiliates (upper(code));
create index if not exists affiliates_email_lower_idx
  on public.affiliates (lower(email))
  where email is not null;

-- -----------------------------------------------------------------------------
-- 3. Pedidos, ítems y boletos
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  rut text not null,
  phone text not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  payment_provider text
    check (payment_provider in ('mercadopago', 'webpay', 'mock')),
  payment_external_id text,
  total_clp int not null,
  raffle_id uuid not null references public.raffles(id),
  referral_code text,
  referral_name text,
  affiliate_id uuid references public.affiliates(id) on delete set null,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  confirmation_email_sent_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  pack_id uuid not null references public.packs(id),
  quantity int not null check (quantity > 0),
  unit_price_clp int not null,
  ticket_count int not null
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  number int not null check (number >= 0 and number <= 99999),
  code text not null,
  email text not null,
  created_at timestamptz not null default now(),
  unique (raffle_id, number),
  unique (raffle_id, code)
);

create index if not exists tickets_email_idx on public.tickets (lower(email));
create index if not exists tickets_code_idx on public.tickets (upper(code));
create index if not exists orders_email_idx on public.orders (lower(email));
create index if not exists orders_payment_external_id_idx on public.orders (payment_external_id);
create index if not exists orders_referral_code_idx on public.orders (upper(referral_code));
create index if not exists orders_confirmation_email_pending_idx
  on public.orders (paid_at desc)
  where status = 'paid' and confirmation_email_sent_at is null;

-- -----------------------------------------------------------------------------
-- 4. Liquidaciones de afiliados
-- -----------------------------------------------------------------------------
create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  amount_clp int not null check (amount_clp > 0),
  period_from date not null,
  period_to date not null,
  note text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists affiliate_payouts_affiliate_id_idx
  on public.affiliate_payouts (affiliate_id);
create index if not exists affiliate_payouts_paid_at_idx
  on public.affiliate_payouts (paid_at desc);

-- -----------------------------------------------------------------------------
-- 5. RLS (Row Level Security)
-- -----------------------------------------------------------------------------
alter table public.raffles enable row level security;
alter table public.packs enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.tickets enable row level security;
alter table public.affiliates enable row level security;
alter table public.affiliate_payouts enable row level security;

drop policy if exists "Public read active raffles" on public.raffles;
create policy "Public read active raffles"
  on public.raffles for select
  using (status = 'active');

drop policy if exists "Public read active packs" on public.packs;
create policy "Public read active packs"
  on public.packs for select
  using (active = true);

-- -----------------------------------------------------------------------------
-- 6. Función Atómica de Asignación Aleatoria de Códigos (Solo service_role)
-- -----------------------------------------------------------------------------
create or replace function public.assign_tickets(
  p_order_id uuid,
  p_count int
) returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_raffle_id uuid;
  v_email text;
  v_raffle_code text;
  v_suffix int;
  v_code text;
  v_assigned text[] := '{}';
  i int;
  v_attempts int;
  v_issued int;
begin
  if p_count is null or p_count < 1 then
    raise exception 'invalid ticket count';
  end if;

  select o.raffle_id, o.email, upper(r.code)
    into v_raffle_id, v_email, v_raffle_code
  from public.orders o
  join public.raffles r on r.id = o.raffle_id
  where o.id = p_order_id
  for update of o;

  if v_raffle_id is null then
    raise exception 'order not found';
  end if;

  if v_raffle_code is null or v_raffle_code !~ '^[A-Z0-9]{2,12}$' then
    raise exception 'raffle code is not configured';
  end if;

  select count(*)::int into v_issued
  from public.tickets
  where raffle_id = v_raffle_id;

  if v_issued + p_count > 100000 then
    raise exception 'ticket pool exhausted';
  end if;

  for i in 1..p_count loop
    v_attempts := 0;
    loop
      v_attempts := v_attempts + 1;
      if v_attempts > 80 then
        raise exception 'could not allocate unique ticket code';
      end if;

      v_suffix := floor(random() * 100000)::int;
      v_code := v_raffle_code || lpad(v_suffix::text, 5, '0');

      begin
        insert into public.tickets (raffle_id, order_id, number, code, email)
        values (v_raffle_id, p_order_id, v_suffix, v_code, v_email);
        v_assigned := array_append(v_assigned, v_code);
        exit;
      exception
        when unique_violation then
          null;
      end;
    end loop;
  end loop;

  return v_assigned;
end;
$$;

revoke all on function public.assign_tickets(uuid, int) from public;
revoke all on function public.assign_tickets(uuid, int) from anon;
revoke all on function public.assign_tickets(uuid, int) from authenticated;
grant execute on function public.assign_tickets(uuid, int) to service_role;

-- -----------------------------------------------------------------------------
-- 7. Datos Iniciales (Seeds con UUIDs fijos usados por la App Next.js)
-- -----------------------------------------------------------------------------
insert into public.raffles (
  id, title, prize_name, ends_at, status, code, ticket_min, ticket_max
)
values (
  'a0000000-0000-4000-8000-000000000001',
  'Sorteo MOTORRAD CORSA R150 0km 2026',
  'MOTORRAD CORSA R150 2026',
  '2026-10-01T00:00:00-03:00',
  'active',
  'S2S26',
  0,
  99999
)
on conflict (id) do update set
  title = excluded.title,
  prize_name = excluded.prize_name;

insert into public.packs (
  id, raffle_id, name, slug, price_clp, ticket_count,
  image_url, illustration_urls, featured, sort_order
)
values
  (
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'Ilustración Puerto Montt',
    'puerto-montt',
    5000,
    1,
    '/images/packs/puertomontt.webp',
    '["/images/packs/puertomontt.webp"]'::jsonb,
    false,
    1
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'Ilustración Llanquihue',
    'llanquihue',
    8000,
    2,
    '/images/packs/llanquihue.webp',
    '["/images/packs/llanquihue.webp"]'::jsonb,
    false,
    3
  ),
  (
    'b0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000001',
    'Ilustración Chiloé',
    'chiloe',
    10000,
    3,
    '/images/packs/chiloe.webp',
    '["/images/packs/chiloe.webp"]'::jsonb,
    true,
    2
  )
on conflict (id) do update set
  name = excluded.name,
  price_clp = excluded.price_clp,
  ticket_count = excluded.ticket_count;

insert into public.affiliates (
  code, name, email, commission_type, commission_value, notes
)
values
  (
    'STJP48',
    'Embajador Sur',
    'embajador@suertu2s.cl',
    'percent',
    10,
    'Cuenta demo — clave se setea en panel admin'
  ),
  (
    'DEMO01',
    'Vendedor Demo',
    'demo@suertu2s.cl',
    'fixed',
    1000,
    'Comisión fija $1.000 — clave se setea en panel admin'
  )
on conflict (code) do nothing;
