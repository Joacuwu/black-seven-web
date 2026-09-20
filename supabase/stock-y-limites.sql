-- Stock por cantidad y límite de intentos.
-- Ejecutar una vez en Supabase: SQL Editor -> New query -> pegar -> Run.

-- 1) Stock por talle. NULL = sin control de stock (se puede vender siempre).
--    Ejemplo: {"M": 5, "L": 0}  ->  M tiene 5 unidades, L está agotado, los talles que no figuran no tienen límite.
alter table public.products add column if not exists stock jsonb;

-- 2) Reserva de stock: descuenta TODO el pedido en una sola operación atómica.
--    Si algún talle no alcanza, no se descuenta nada y se devuelve el error OUT_OF_STOCK.
create or replace function public.reserve_stock(p_items jsonb)
returns jsonb
language plpgsql
as $$
declare
  item jsonb;
  v_stock jsonb;
  v_available integer;
  v_qty integer;
  v_low jsonb := '[]'::jsonb;
begin
  for item in select * from jsonb_array_elements(p_items) loop
    v_qty := (item->>'quantity')::integer;

    select stock into v_stock from public.products
      where id = (item->>'product_id')::integer and active
      for update;

    if not found then
      raise exception 'OUT_OF_STOCK:%', item->>'product_id';
    end if;

    -- sin control de stock, o talle sin límite
    if v_stock is null or not (v_stock ? (item->>'size')) then
      continue;
    end if;

    v_available := (v_stock->>(item->>'size'))::integer;
    if v_available < v_qty then
      raise exception 'OUT_OF_STOCK:%', item->>'product_id';
    end if;

    update public.products
      set stock = jsonb_set(stock, array[item->>'size'], to_jsonb(v_available - v_qty))
      where id = (item->>'product_id')::integer;

    v_low := v_low || jsonb_build_array(jsonb_build_object(
      'product_id', (item->>'product_id')::integer,
      'size', item->>'size',
      'remaining', v_available - v_qty
    ));
  end loop;

  return v_low; -- talles con stock controlado que quedaron después de reservar
end;
$$;

-- 3) Devolver stock (pedido cancelado o que falló).
create or replace function public.release_stock(p_items jsonb)
returns void
language plpgsql
as $$
declare
  item jsonb;
  v_stock jsonb;
begin
  for item in select * from jsonb_array_elements(p_items) loop
    select stock into v_stock from public.products
      where id = (item->>'product_id')::integer
      for update;

    if found and v_stock is not null and v_stock ? (item->>'size') then
      update public.products
        set stock = jsonb_set(stock, array[item->>'size'],
              to_jsonb((v_stock->>(item->>'size'))::integer + (item->>'quantity')::integer))
        where id = (item->>'product_id')::integer;
    end if;
  end loop;
end;
$$;

-- 4) Límite de intentos (login del panel, checkout, consulta de pedidos).
create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key, window_start)
);
alter table public.rate_limits enable row level security;

create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count integer;
begin
  insert into public.rate_limits (key, window_start, count) values (p_key, v_window, 1)
  on conflict (key, window_start) do update set count = public.rate_limits.count + 1
  returning count into v_count;

  -- limpieza ocasional de registros viejos
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return v_count <= p_limit;
end;
$$;

-- 5) Seguridad: estas funciones son solo para el servidor. Se les quita el acceso público
--    para que nadie pueda llamarlas desde el navegador con la clave pública.
revoke all on function public.reserve_stock(jsonb) from public, anon, authenticated;
revoke all on function public.release_stock(jsonb) from public, anon, authenticated;
revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.reserve_stock(jsonb) to service_role;
grant execute on function public.release_stock(jsonb) to service_role;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
