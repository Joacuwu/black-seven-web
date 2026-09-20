-- Esquema de pedidos de BLACK SEVEN.
-- Ejecutar una vez en Supabase: SQL Editor -> New query -> pegar -> Run.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer not null unique,
  status text not null default 'pending_payment'
    check (status in (
      'pending_payment',   -- esperando pago online (Naranja X)
      'pending_transfer',  -- esperando comprobante de transferencia
      'paid',
      'preparing',
      'shipped',
      'delivered',
      'cancelled'
    )),
  payment_method text not null check (payment_method in ('transferencia', 'naranjax')),
  provider_payment_id text,

  customer_name text not null,
  customer_lastname text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_zip text not null,

  subtotal integer not null,
  discount integer not null default 0,
  shipping_cost integer not null default 0,
  total integer not null,

  tracking_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id integer not null,
  name text not null,
  size text not null,
  unit_price integer not null,
  quantity integer not null check (quantity > 0)
);

create index if not exists orders_email_idx on public.orders (lower(customer_email));
create index if not exists order_items_order_id_idx on public.order_items (order_id);

create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- Seguridad: RLS activado y SIN políticas. Solo el servidor (service role key)
-- puede leer y escribir; el navegador nunca toca estas tablas directamente.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
