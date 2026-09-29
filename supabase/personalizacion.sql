-- Remeras para la página "Personalizá tu remera" (elegir corte: oversize, boxy fit o clásico).
-- Ejecutar una vez en Supabase: SQL Editor -> New query -> pegar -> Run.
--
-- Son 3 productos normales del catálogo (mismo precio y talles); la página /personalizar
-- los muestra juntos con una tarjeta por corte. Las fotos son provisorias (la misma que
-- REMERA 777 WHITE): reemplazalas por fotos reales desde el panel, en Productos, cuando las tengas.

insert into public.products (name, category, price, sizes, images, description, details, sort_order)
select 'REMERA PERSONALIZADA - OVERSIZE', 'remeras', 35000,
       array['S', 'M', 'L', 'XL']::text[],
       array['/remera777.jpg', '/remera777hover.jpg']::text[],
       'Elegí el corte oversize: caída amplia y relajada, ideal para un look urbano y cómodo.',
       array['100% Algodón Jersey Heavyweight 240g', 'Corte Oversize', 'Lavar con agua fría y del revés']::text[],
       15
where not exists (select 1 from public.products where name = 'REMERA PERSONALIZADA - OVERSIZE');

insert into public.products (name, category, price, sizes, images, description, details, sort_order)
select 'REMERA PERSONALIZADA - BOXY FIT', 'remeras', 35000,
       array['S', 'M', 'L', 'XL']::text[],
       array['/remera777.jpg', '/remera777hover.jpg']::text[],
       'Elegí el corte boxy fit: ancho parejo de hombro a cintura, el clásico del streetwear.',
       array['100% Algodón Jersey Heavyweight 240g', 'Corte Boxy Fit', 'Lavar con agua fría y del revés']::text[],
       16
where not exists (select 1 from public.products where name = 'REMERA PERSONALIZADA - BOXY FIT');

insert into public.products (name, category, price, sizes, images, description, details, sort_order)
select 'REMERA PERSONALIZADA - CLÁSICO', 'remeras', 35000,
       array['S', 'M', 'L', 'XL']::text[],
       array['/remera777.jpg', '/remera777hover.jpg']::text[],
       'Elegí el corte clásico: entallado a la medida real, prolijo y atemporal.',
       array['100% Algodón Jersey Heavyweight 240g', 'Corte Clásico', 'Lavar con agua fría y del revés']::text[],
       17
where not exists (select 1 from public.products where name = 'REMERA PERSONALIZADA - CLÁSICO');
