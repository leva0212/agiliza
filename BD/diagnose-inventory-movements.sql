-- Diagnóstico de Movimientos de inventario
-- Ejecutar en Supabase SQL Editor. No modifica datos.

-- 1) Confirma que los movimientos existen físicamente y muestra los últimos 20.
SELECT
  m.id,
  m.created_at,
  m.inventory_id,
  m.quantity_before,
  m.quantity_change,
  m.quantity_after,
  m.reason,
  m.notes
FROM public.inventory_movements AS m
ORDER BY m.created_at DESC
LIMIT 20;

-- 2) Prueba la función que usa la página, sin filtros de texto ni fecha.
-- Si muestra registros aquí y no en la pantalla, el origen es el rango de fechas del navegador.
SELECT *
FROM public.get_inventory_movements_page(
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, 25, 0
);