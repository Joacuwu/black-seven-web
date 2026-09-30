-- Reemplaza la columna design_url (de la función "Personalizar" que se revirtió)
-- por una columna simple "cut" con el corte de remera elegido (Oversize / Clásico / Boxy Fit).
ALTER TABLE public.order_items DROP COLUMN IF EXISTS design_url;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS cut text;

-- Borra los 3 productos placeholder que se habían creado para la función "Personalizar".
DELETE FROM public.products
WHERE name IN ('REMERA PERSONALIZADA - OVERSIZE', 'REMERA PERSONALIZADA - BOXY FIT', 'REMERA PERSONALIZADA - CLASICO');
