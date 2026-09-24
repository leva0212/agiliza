-- Lectura segura: guarda el resultado antes de cualquier migración.
SELECT
  p.oid::regprocedure AS firma,
  pg_get_functiondef(p.oid) AS definicion_actual
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('get_province_coverage_counts', 'get_district_neighborhoods')
ORDER BY p.proname, p.oid::regprocedure::text;