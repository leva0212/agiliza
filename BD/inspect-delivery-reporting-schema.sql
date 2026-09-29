-- Inspección de estructura para reportes de entrega, cobros y pagos.
-- Solo lectura: no crea, actualiza ni elimina información.

-- Tablas existentes que pueden representar reportes, cierres, cobros, pagos o liquidaciones.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND (
    table_name ILIKE ANY (ARRAY[
      '%report%', '%settle%', '%liquid%', '%payment%', '%payout%',
      '%billing%', '%invoice%', '%charge%', '%collection%', '%delivery%'
    ])
  )
ORDER BY table_name;

-- Columnas de las tablas financieras y de tarifas relevantes.
SELECT table_name, ordinal_position, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'delivery_rates',
    'courier_delivery_rates',
    'shipments',
    'shipment_status_history'
  )
ORDER BY table_name, ordinal_position;

-- Restricciones de esas tablas, para conocer sus relaciones y posibles llaves únicas.
SELECT
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name IN (
    'delivery_rates',
    'courier_delivery_rates',
    'shipments',
    'shipment_status_history'
  )
ORDER BY table_name, constraint_type, constraint_name;

-- Políticas RLS asociadas a posibles tablas financieras ya existentes.
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    tablename ILIKE ANY (ARRAY[
      '%report%', '%settle%', '%liquid%', '%payment%', '%payout%',
      '%billing%', '%invoice%', '%charge%', '%collection%', '%delivery%'
    ])
  )
ORDER BY tablename, policyname;