-- Rollback de la función Activar/Desactivar cobertura de rutas.
-- No elimina rutas, barrios ni filas de route_coverage.

DROP INDEX IF EXISTS public.routes_coverage_active_idx;
ALTER TABLE public.routes DROP COLUMN IF EXISTS coverage_active;