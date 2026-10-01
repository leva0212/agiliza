-- Solo lectura. Devuelve cronogramas y períodos en una única respuesta del editor SQL.
SELECT jsonb_build_object(
  'active_schedules', coalesce((
    SELECT jsonb_agg(to_jsonb(row_data) ORDER BY row_data.party_type, row_data.party_id NULLS FIRST, row_data.created_at)
    FROM (
      SELECT schedule.id AS schedule_id, schedule.party_type, schedule.party_id,
        schedule.name, schedule.frequency, schedule.interval_days, schedule.anchor_date,
        schedule.auto_rollover, schedule.created_at
      FROM settlement_schedules schedule
      WHERE schedule.active
    ) row_data
  ), '[]'::jsonb),
  'all_periods', coalesce((
    SELECT jsonb_agg(to_jsonb(row_data) ORDER BY row_data.party_type, row_data.party_id, row_data.starts_at DESC)
    FROM (
      SELECT period.id AS period_id, period.schedule_id, period.party_type, period.party_id,
        period.starts_at AT TIME ZONE 'America/Costa_Rica' AS starts_at,
        period.ends_at AT TIME ZONE 'America/Costa_Rica' AS ends_at,
        period.status, period.closed_at AT TIME ZONE 'America/Costa_Rica' AS closed_at
      FROM settlement_periods period
    ) row_data
  ), '[]'::jsonb)
) AS assignment_diagnostic;
