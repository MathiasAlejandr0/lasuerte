-- =============================================================================
-- Suertu2s — esquema completo (aplicar UNA sola vez en un proyecto Supabase nuevo)
--
-- Incluye:
--   • Sorteo con código propio (ej. S2S26)
--   • Packs / pedidos / ítems
--   • Códigos de participación = código_sorteo + 5 dígitos ALEATORIOS
--     (no secuenciales; no revelan cuántas ventas hay)
--   • Afiliados + liquidaciones + password portal
--   • Flag de email de confirmación
--   • RLS + RPC assign_tickets (solo service_role)
--   • Seeds con IDs fijos usados por el código Next.js
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Sorteo y packs
-- -----------------------------------------------------------------------------
create table public.raffles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prize_name text not null,
  ends_at timestamptz not null,
  status text not null default 'active'
    check (status in ('active', 'closed', 'draft')),
  -- Prefijo público del código de participación (ej. S2S26 + 5 dígitos)
  code text not null unique
    check (code ~ '^[A-Z0-9]{2,12}$'),
  ticket_min int not null default 0,
  ticket_max int not null default 99999,
  created_at timestamptz not null default now()
);

create table public.packs (
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
-- Afiliados (antes de orders por FK affiliate_id)
-- -----------------------------------------------------------------------------
create table public.affiliates (
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
  -- scrypt$hash — portal /afiliados (se setea desde el admin)
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index affiliates_code_idx on public.affiliates (upper(code));
create index affiliates_email_lower_idx
  on public.affiliates (lower(email))
  where email is not null;

-- -----------------------------------------------------------------------------
-- Pedidos, ítems y códigos de participación
-- -----------------------------------------------------------------------------
create table public.orders (
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
  -- Flag para reintentar email de confirmación tras webhooks
  confirmation_email_sent_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  pack_id uuid not null references public.packs(id),
  quantity int not null check (quantity > 0),
  unit_price_clp int not null,
  ticket_count int not null
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  -- Sufijo aleatorio 0..99999 (NO secuencial; no refleja ventas)
  number int not null check (number >= 0 and number <= 99999),
  -- Código completo: raffles.code || lpad(number, 5, '0')  → ej. S2S2648291
  code text not null,
  email text not null,
  created_at timestamptz not null default now(),
  unique (raffle_id, number),
  unique (raffle_id, code)
);

create index tickets_email_idx on public.tickets (lower(email));
create index tickets_code_idx on public.tickets (upper(code));
create index orders_email_idx on public.orders (lower(email));
create index orders_payment_external_id_idx on public.orders (payment_external_id);
create index orders_referral_code_idx on public.orders (upper(referral_code));
create index orders_confirmation_email_pending_idx
  on public.orders (paid_at desc)
  where status = 'paid' and confirmation_email_sent_at is null;

-- -----------------------------------------------------------------------------
-- Liquidaciones de afiliados
-- -----------------------------------------------------------------------------
create table public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  amount_clp int not null check (amount_clp > 0),
  period_from date not null,
  period_to date not null,
  note text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index affiliate_payouts_affiliate_id_idx
  on public.affiliate_payouts (affiliate_id);
create index affiliate_payouts_paid_at_idx
  on public.affiliate_payouts (paid_at desc);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.raffles enable row level security;
alter table public.packs enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.tickets enable row level security;
alter table public.affiliates enable row level security;
alter table public.affiliate_payouts enable row level security;

create policy "Public read active raffles"
  on public.raffles for select
  using (status = 'active');

create policy "Public read active packs"
  on public.packs for select
  using (active = true);

-- orders / order_items / tickets / affiliates / payouts:
-- sin policies públicas → solo service_role vía API Next.js

-- -----------------------------------------------------------------------------
-- Asignación atómica de códigos aleatorios (solo service_role)
-- Retorna text[] con los códigos completos (ej. {S2S2648291,S2S2600317})
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

      -- 5 dígitos aleatorios: 00000..99999 (no correlativos)
      v_suffix := floor(random() * 100000)::int;
      v_code := v_raffle_code || lpad(v_suffix::text, 5, '0');

      begin
        insert into public.tickets (raffle_id, order_id, number, code, email)
        values (v_raffle_id, p_order_id, v_suffix, v_code, v_email);
        v_assigned := array_append(v_assigned, v_code);
        exit;
      exception
        when unique_violation then
          -- colisión rara: reintentar con otro aleatorio
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
-- Seeds (IDs fijos usados por el código Next.js)
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
);

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
  );

-- Afiliados demo (sin password_hash: se setea en Admin → Afiliados)
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
    'Cuenta de demostración — asignar clave en el admin'
  ),
  (
    'DEMO01',
    'Vendedor Demo',
    'demo@suertu2s.cl',
    'fixed',
    1000,
    'Comisión fija $1.000 — asignar clave en el admin'
  );
