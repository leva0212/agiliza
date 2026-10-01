-- Solo lectura: identifica los períodos reales que existen detrás de cada cronograma.
-- Úsalo para confirmar cuál está cerrado antes de modificar estados o cronogramas.
SELECT
  period.id AS period_id,
  schedule.party_type AS tipo,
  CASE
    WHEN schedule.party_type = 'company' THEN company.name
    ELSE profile.full_name
  END AS aplica_a,
  period.starts_at AT TIME ZONE 'America/Costa_Rica' AS inicia_en_cr,
  period.ends_at AT TIME ZONE 'America/Costa_Rica' AS termina_en_cr,
  period.status AS estado,
  period.closed_at AT TIME ZONE 'America/Costa_Rica' AS cerrado_en_cr,
  schedule.frequency AS frecuencia,
  schedule.anchor_date AS fecha_ancla
FROM settlement_periods period
JOIN settlement_schedules schedule ON schedule.id = period.schedule_id
LEFT JOIN companies company ON company.id = period.party_id AND period.party_type = 'company'
LEFT JOIN couriers courier ON courier.id = period.party_id AND period.party_type = 'courier'
LEFT JOIN profiles profile ON profile.id = courier.profile_id
ORDER BY period.status, period.starts_at DESC, tipo, aplica_a;
