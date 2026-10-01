-- Recupera registros financieros que existen pero nunca se asignaron a un cierre.
-- Los asigna al período ABIERTO ACTUAL de cada DTS o mensajero, nunca a un período cerrado.

CREATE OR REPLACE FUNCTION public.get_unassigned_settlement_financial_records()
RETURNS TABLE(company_records bigint, courier_records bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles profile
    JOIN companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid()
      AND profile.active
      AND profile.role IN ('super_admin','company_admin')
      AND (coalesce(company.is_owner_company,false) OR coalesce(company.is_system_company,false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para recuperar registros de liquidación.';
  END IF;

  RETURN QUERY
  SELECT
    count(*) FILTER (WHERE financial.record_type = 'company_delivery_charge'),
    count(*) FILTER (WHERE financial.record_type = 'courier_delivery_payment')
  FROM shipment_delivery_financial_records financial
  WHERE financial.status = 'pending'
    AND NOT EXISTS (
      SELECT 1 FROM settlement_period_items item
      WHERE item.financial_record_id = financial.id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_unassigned_financial_records_to_current_period(p_party_type text)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  financial record;
  schedule_row settlement_schedules%ROWTYPE;
  v_subject_id uuid;
  v_period_id uuid;
  v_start_date date;
  v_end_date date;
  v_days integer;
  v_period_status text;
  v_assigned integer := 0;
  v_schedule_found boolean := false;
BEGIN
  IF p_party_type NOT IN ('company','courier') THEN
    RAISE EXCEPTION 'Tipo de liquidación no válido.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles profile
    JOIN companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid()
      AND profile.active
      AND profile.role IN ('super_admin','company_admin')
      AND (coalesce(company.is_owner_company,false) OR coalesce(company.is_system_company,false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para recuperar registros de liquidación.';
  END IF;

  FOR financial IN
    SELECT financial_record.*
    FROM shipment_delivery_financial_records financial_record
    WHERE financial_record.status = 'pending'
      AND financial_record.record_type = CASE WHEN p_party_type = 'company' THEN 'company_delivery_charge' ELSE 'courier_delivery_payment' END
      AND NOT EXISTS (
        SELECT 1 FROM settlement_period_items item
        WHERE item.financial_record_id = financial_record.id
      )
    ORDER BY financial_record.occurred_at, financial_record.id
  LOOP
    v_subject_id := CASE WHEN p_party_type = 'company' THEN financial.company_id ELSE financial.courier_id END;
    IF v_subject_id IS NULL THEN CONTINUE; END IF;

    SELECT schedule.* INTO schedule_row
    FROM settlement_schedules schedule
    WHERE schedule.active
      AND schedule.party_type = p_party_type
      AND (schedule.party_id = v_subject_id OR schedule.party_id IS NULL)
    ORDER BY (schedule.party_id IS NOT NULL) DESC
    LIMIT 1;
    IF NOT FOUND THEN CONTINUE; END IF;
    v_schedule_found := true;

    IF schedule_row.frequency = 'monthly' THEN
      v_start_date := date_trunc('month', now() AT TIME ZONE 'America/Costa_Rica')::date;
      v_end_date := (v_start_date + interval '1 month')::date;
    ELSE
      v_days := CASE schedule_row.frequency WHEN 'weekly' THEN 7 WHEN 'biweekly' THEN 14 ELSE schedule_row.interval_days END;
      v_start_date := schedule_row.anchor_date + floor(((now() AT TIME ZONE 'America/Costa_Rica')::date - schedule_row.anchor_date)::numeric / v_days)::integer * v_days;
      v_end_date := v_start_date + v_days;
    END IF;

    SELECT period.id INTO v_period_id
    FROM settlement_periods period
    WHERE period.schedule_id = schedule_row.id
      AND period.party_id = v_subject_id
      AND period.starts_at = (v_start_date::timestamp AT TIME ZONE 'America/Costa_Rica')
    FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO settlement_periods(schedule_id, party_type, party_id, starts_at, ends_at, status)
      VALUES (schedule_row.id, p_party_type, v_subject_id,
        (v_start_date::timestamp AT TIME ZONE 'America/Costa_Rica'),
        (v_end_date::timestamp AT TIME ZONE 'America/Costa_Rica'), 'open')
      RETURNING id INTO v_period_id;
    END IF;

    SELECT period.status::text INTO v_period_status FROM settlement_periods period WHERE period.id = v_period_id;
    IF v_period_status IS DISTINCT FROM 'open' THEN
      RAISE EXCEPTION 'El período actual de % no está abierto. Período: % · Estado: %.', p_party_type, v_period_id, coalesce(v_period_status, 'no encontrado');
    END IF;

    INSERT INTO settlement_period_items(period_id, shipment_id, company_id, courier_id, financial_record_id, original_amount, final_amount)
    SELECT v_period_id, financial.shipment_id, financial.company_id, financial.courier_id, financial.id, financial.original_amount, financial.amount
    WHERE NOT EXISTS (
      SELECT 1 FROM settlement_period_items item
      WHERE item.financial_record_id = financial.id
    );
    IF FOUND THEN v_assigned := v_assigned + 1; END IF;
  END LOOP;

  IF NOT v_schedule_found AND EXISTS (
    SELECT 1 FROM shipment_delivery_financial_records financial_record
    WHERE financial_record.status = 'pending'
      AND financial_record.record_type = CASE WHEN p_party_type = 'company' THEN 'company_delivery_charge' ELSE 'courier_delivery_payment' END
      AND NOT EXISTS (SELECT 1 FROM settlement_period_items item WHERE item.financial_record_id = financial_record.id)
  ) THEN
    RAISE EXCEPTION 'No existe un cronograma activo para %. Cree un cronograma antes de recuperar estos registros.', CASE WHEN p_party_type = 'company' THEN 'DTS' ELSE 'mensajeros' END;
  END IF;

  RETURN v_assigned;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_unassigned_settlement_financial_records() TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_unassigned_financial_records_to_current_period(text) TO authenticated;
NOTIFY pgrst, 'reload schema';
