-- Corrige la asignación automática al cierre en bases que no tienen los índices
-- únicos asumidos por una versión anterior. No modifica envíos ni períodos existentes.

CREATE OR REPLACE FUNCTION public.assign_financial_record_to_settlement(p_record_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  record_row public.shipment_delivery_financial_records%ROWTYPE;
  schedule_row public.settlement_schedules%ROWTYPE;
  subject_type text;
  subject_id uuid;
  start_date date;
  end_date date;
  period_id uuid;
  period_status text;
  days_per_period integer;
BEGIN
  SELECT * INTO record_row FROM public.shipment_delivery_financial_records WHERE id = p_record_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'El registro financiero no existe.'; END IF;

  subject_type := CASE WHEN record_row.record_type = 'company_delivery_charge' THEN 'company' ELSE 'courier' END;
  subject_id := CASE WHEN subject_type = 'company' THEN record_row.company_id ELSE record_row.courier_id END;
  IF subject_id IS NULL THEN RETURN; END IF;

  SELECT * INTO schedule_row
  FROM public.settlement_schedules schedule
  WHERE schedule.active
    AND schedule.party_type = subject_type
    AND (schedule.party_id = subject_id OR schedule.party_id IS NULL)
  ORDER BY (schedule.party_id IS NOT NULL) DESC
  LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  IF schedule_row.frequency = 'monthly' THEN
    start_date := date_trunc('month', record_row.occurred_at AT TIME ZONE 'America/Costa_Rica')::date;
    end_date := (start_date + interval '1 month')::date;
  ELSE
    days_per_period := CASE schedule_row.frequency WHEN 'weekly' THEN 7 WHEN 'biweekly' THEN 14 ELSE schedule_row.interval_days END;
    start_date := schedule_row.anchor_date + floor(((record_row.occurred_at AT TIME ZONE 'America/Costa_Rica')::date - schedule_row.anchor_date)::numeric / days_per_period)::integer * days_per_period;
    end_date := start_date + days_per_period;
  END IF;

  SELECT period.id INTO period_id
  FROM public.settlement_periods period
  WHERE period.schedule_id = schedule_row.id
    AND period.party_id = subject_id
    AND period.starts_at = (start_date::timestamp AT TIME ZONE 'America/Costa_Rica')
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.settlement_periods(
  schedule_id,
  party_type,
  party_id,
  starts_at,
  ends_at,
  status
)
VALUES (
  schedule_row.id,
  subject_type,
  subject_id,
  (start_date::timestamp AT TIME ZONE 'America/Costa_Rica'),
  (end_date::timestamp AT TIME ZONE 'America/Costa_Rica'),
  'open'
)
RETURNING id INTO period_id;
  END IF;

  SELECT period.status::text INTO period_status
  FROM public.settlement_periods period
  WHERE period.id = period_id;
  IF period_status IS DISTINCT FROM 'open' THEN
    RAISE EXCEPTION 'El período financiero correspondiente no está abierto. Período: % · Estado: %.', period_id, coalesce(period_status, 'no encontrado');
  END IF;

  INSERT INTO public.settlement_period_items(period_id, shipment_id, company_id, courier_id, financial_record_id, original_amount, final_amount)
  SELECT period_id, record_row.shipment_id, record_row.company_id, record_row.courier_id, record_row.id, record_row.original_amount, record_row.amount
  WHERE NOT EXISTS (
    SELECT 1 FROM public.settlement_period_items item
    WHERE item.financial_record_id = record_row.id
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
