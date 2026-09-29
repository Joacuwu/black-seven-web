-- Guarda el diseño (PNG) que el cliente ubicó sobre la remera en "Personalizá tu remera",
-- para que quede junto al pedido (el vendedor lo ve en el panel y en el mail de aviso).
-- Ejecutar una vez en Supabase: SQL Editor -> New query -> pegar -> Run.

alter table public.order_items add column if not exists design_url text;
