-- Al eliminar una ruta, sus tarifas de mensajero son configuración asociada
-- y se eliminan junto con la ruta. Los envíos ya usan ON DELETE SET NULL.

BEGIN;

ALTER TABLE public.courier_delivery_rates
  DROP CONSTRAINT IF EXISTS fk_courier_delivery_rates_route;

ALTER TABLE public.courier_delivery_rates
  ADD CONSTRAINT fk_courier_delivery_rates_route
  FOREIGN KEY (route_id)
  REFERENCES public.routes(id)
  ON DELETE CASCADE;

COMMIT;