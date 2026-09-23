-- Permite eliminar una ruta sin eliminar los envíos ya registrados.
-- Los envíos asociados conservarán su información e historial con route_id = NULL.

ALTER TABLE public.shipments
  DROP CONSTRAINT IF EXISTS shipments_route_id_fkey;

ALTER TABLE public.shipments
  ADD CONSTRAINT shipments_route_id_fkey
  FOREIGN KEY (route_id)
  REFERENCES public.routes(id)
  ON DELETE SET NULL;