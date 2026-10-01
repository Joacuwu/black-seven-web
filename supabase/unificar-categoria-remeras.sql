-- Varios productos quedaron cargados como categoría "remera" (singular) en vez de
-- "remeras" (la categoría correcta/consistente con el resto del catálogo). Esto hacía
-- que /coleccion los mostrara en un filtro aparte y que no les apareciera el selector
-- de Corte (que solo se activa para category = "remeras").
UPDATE public.products SET category = 'remeras' WHERE category = 'remera';
