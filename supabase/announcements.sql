-- Cartel rojo de anuncios, editable desde el panel. Usa la tabla site_settings (creada en hero.sql).
-- Ejecutar una vez en Supabase: SQL Editor -> New query -> pegar -> Run.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null
);

alter table public.site_settings enable row level security;

-- Mensajes actuales de la tienda, para no arrancar con el cartel vacío.
insert into public.site_settings (key, value) values (
  'announcements',
  '[
    {"id": "seed-1", "text": "ENVÍOS GRATIS A TODO EL PAÍS EN COMPRAS SUPERIORES A $50.000", "active": true},
    {"id": "seed-2", "text": "10% DE DESCUENTO PAGANDO POR TRANSFERENCIA", "active": true},
    {"id": "seed-3", "text": "DROP #01 DISPONIBLE - EDICIÓN LIMITADA", "active": true}
  ]'::jsonb
)
on conflict (key) do nothing;
