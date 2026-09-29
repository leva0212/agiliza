-- Solo lectura. Un único resultado para que el editor no oculte las columnas.
SELECT jsonb_build_object(
  'columnas', (
    SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.table_name, x.ordinal_position), '[]'::jsonb)
    FROM (
      SELECT table_name, ordinal_position, column_name, data_type, udt_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('settlement_schedules', 'settlement_periods', 'settlement_period_items', 'settlements', 'settlement_items')
    ) x
  ),
  'restricciones', (
    SELECT coalesce(jsonb_agg(to_jsonb(y) ORDER BY y.table_name, y.constraint_name), '[]'::jsonb)
    FROM (
      SELECT table_name, constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name IN ('settlement_schedules', 'settlement_periods', 'settlement_period_items', 'settlements', 'settlement_items')
    ) y
  )
) AS esquema_cierres;
