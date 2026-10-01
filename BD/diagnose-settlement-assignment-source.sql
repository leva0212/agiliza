-- Solo lectura. Expone la causa real si la función intenta usar un cierre distinto
-- al que se ve en el resumen de períodos.

-- 1) Todos los cronogramas activos, incluidos los específicos y posibles duplicados.
SELECT
  schedule.id AS schedule_id,
  schedule.party_type AS tipo,
  schedule.party_id,
  schedule.name,
  schedule.frequency,
  schedule.interval_days,
  schedule.anchor_date,
  schedule.auto_rollover,
  schedule.active,
  schedule.created_at
FROM settlement_schedules schedule
WHERE schedule.active
ORDER BY schedule.party_type, schedule.party_id NULLS FIRST, schedule.created_at;

-- 2) Todos los períodos, incluso si ya no tienen un cronograma activo.
SELECT
  period.id AS period_id,
  period.schedule_id,
  period.party_type AS tipo,
  period.party_id,
  period.starts_at AT TIME ZONE 'America/Costa_Rica' AS inicia_en_cr,
  period.ends_at AT TIME ZONE 'America/Costa_Rica' AS termina_en_cr,
  period.status,
  period.closed_at AT TIME ZONE 'America/Costa_Rica' AS cerrado_en_cr
FROM settlement_periods period
ORDER BY period.party_type, period.party_id, period.starts_at DESC;

-- 3) Confirmación de que está instalada la versión actual de la función.
SELECT pg_get_functiondef(
  'public.assign_financial_record_to_settlement(uuid)'::regprocedure
) AS funcion_activa;
