-- Rollback funcional de emergencia.
-- Reactiva todas las rutas para que vuelvan a contar como cobertura.
-- Para restaurar exactamente los RPC anteriores, ejecuta también las dos definiciones
-- guardadas al correr route-active-coverage-preflight.sql.

BEGIN;
UPDATE public.routes SET active = true WHERE active IS DISTINCT FROM true;
COMMIT;