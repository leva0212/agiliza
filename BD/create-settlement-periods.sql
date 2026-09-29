-- Ejecutar después de add-delivery-financial-records.sql.
-- Define períodos automáticos para cobrar a DTS y pagar a mensajeros.

CREATE TABLE IF NOT EXISTS public.settlement_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_type text NOT NULL CHECK (party_type IN ('company', 'courier')),
  party_id uuid NULL,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'custom_days')),
  interval_days integer NULL CHECK (interval_days IS NULL OR interval_days BETWEEN 1 AND 366),
  anchor_date date NOT NULL DEFAULT current_date,
  auto_rollover boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((frequency = 'custom_days' AND interval_days IS NOT NULL) OR (frequency <> 'custom_days' AND interval_days IS NULL))
);
-- Compatibilidad con el modelo de cierres anterior ya existente en producción.
ALTER TABLE public.settlement_schedules
  ADD COLUMN IF NOT EXISTS party_type text,
  ADD COLUMN IF NOT EXISTS party_id uuid,
  ADD COLUMN IF NOT EXISTS frequency text,
  ADD COLUMN IF NOT EXISTS interval_days integer,
  ADD COLUMN IF NOT EXISTS anchor_date date,
  ADD COLUMN IF NOT EXISTS created_by uuid;
UPDATE public.settlement_schedules
   SET party_type = coalesce(party_type, CASE WHEN target_type IN ('company','courier') THEN target_type ELSE 'company' END),
       frequency = coalesce(frequency, CASE frequency_days WHEN 7 THEN 'weekly' WHEN 14 THEN 'biweekly' WHEN 30 THEN 'monthly' ELSE 'custom_days' END),
       interval_days = coalesce(interval_days, CASE WHEN frequency_days NOT IN (7,14,30) THEN frequency_days ELSE NULL END),
       anchor_date = coalesce(anchor_date, created_at::date)
 WHERE party_type IS NULL OR frequency IS NULL OR anchor_date IS NULL;
ALTER TABLE public.settlement_schedules
  ALTER COLUMN party_type SET NOT NULL,
  ALTER COLUMN frequency SET NOT NULL,
  ALTER COLUMN anchor_date SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS settlement_schedules_specific_party_idx ON public.settlement_schedules(party_type, party_id) WHERE party_id IS NOT NULL AND active;
CREATE UNIQUE INDEX IF NOT EXISTS settlement_schedules_default_party_idx ON public.settlement_schedules(party_type) WHERE party_id IS NULL AND active;

CREATE TABLE IF NOT EXISTS public.settlement_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.settlement_schedules(id) ON DELETE RESTRICT,
  party_type text NOT NULL CHECK (party_type IN ('company', 'courier')),
  party_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  closed_at timestamptz NULL,
  closed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  UNIQUE (schedule_id, party_id, starts_at)
);
ALTER TABLE public.settlement_periods
  ADD COLUMN IF NOT EXISTS party_type text,
  ADD COLUMN IF NOT EXISTS party_id uuid,
  ADD COLUMN IF NOT EXISTS closed_by uuid;
UPDATE public.settlement_periods SET status = 'open' WHERE status = 'active';
CREATE INDEX IF NOT EXISTS settlement_periods_party_open_idx ON public.settlement_periods(party_type, party_id, status, starts_at DESC);

CREATE TABLE IF NOT EXISTS public.settlement_period_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id uuid NOT NULL REFERENCES public.settlement_periods(id) ON DELETE RESTRICT,
  financial_record_id uuid NOT NULL UNIQUE REFERENCES public.shipment_delivery_financial_records(id) ON DELETE RESTRICT,
  original_amount numeric(14,2) NOT NULL CHECK (original_amount >= 0),
  final_amount numeric(14,2) NOT NULL CHECK (final_amount >= 0),
  excluded boolean NOT NULL DEFAULT false,
  exclusion_reason text NULL CHECK (exclusion_reason IS NULL OR length(trim(exclusion_reason)) BETWEEN 1 AND 500),
  excluded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  excluded_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((excluded = false AND exclusion_reason IS NULL) OR (excluded = true AND exclusion_reason IS NOT NULL))
);
ALTER TABLE public.settlement_period_items
  ADD COLUMN IF NOT EXISTS financial_record_id uuid,
  ADD COLUMN IF NOT EXISTS original_amount numeric(14,2),
  ADD COLUMN IF NOT EXISTS final_amount numeric(14,2),
  ADD COLUMN IF NOT EXISTS exclusion_reason text,
  ADD COLUMN IF NOT EXISTS excluded_by uuid;
ALTER TABLE public.settlement_period_items
  DROP CONSTRAINT IF EXISTS settlement_period_items_unique;
CREATE UNIQUE INDEX IF NOT EXISTS settlement_period_items_financial_record_idx
  ON public.settlement_period_items(financial_record_id) WHERE financial_record_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS settlement_period_items_period_idx ON public.settlement_period_items(period_id, excluded);

ALTER TABLE public.settlement_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_period_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.assign_financial_record_to_settlement(p_record_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  record_row public.shipment_delivery_financial_records%ROWTYPE;
  schedule_row public.settlement_schedules%ROWTYPE;
  subject_type text;
  subject_id uuid;
  start_date date;
  end_date date;
  period_id uuid;
  days_per_period integer;
BEGIN
  SELECT * INTO record_row FROM public.shipment_delivery_financial_records WHERE id = p_record_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'El registro financiero no existe.'; END IF;
  subject_type := CASE WHEN record_row.record_type = 'company_delivery_charge' THEN 'company' ELSE 'courier' END;
  subject_id := CASE WHEN subject_type = 'company' THEN record_row.company_id ELSE record_row.courier_id END;
  IF subject_id IS NULL THEN RETURN; END IF;
  SELECT * INTO schedule_row FROM public.settlement_schedules
   WHERE active AND party_type = subject_type AND (party_id = subject_id OR party_id IS NULL)
   ORDER BY (party_id IS NOT NULL) DESC LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;
  IF schedule_row.frequency = 'monthly' THEN
    start_date := date_trunc('month', record_row.occurred_at AT TIME ZONE 'America/Costa_Rica')::date;
    end_date := (start_date + interval '1 month')::date;
  ELSE
    days_per_period := CASE schedule_row.frequency WHEN 'weekly' THEN 7 WHEN 'biweekly' THEN 14 ELSE schedule_row.interval_days END;
    start_date := schedule_row.anchor_date + floor(((record_row.occurred_at AT TIME ZONE 'America/Costa_Rica')::date - schedule_row.anchor_date)::numeric / days_per_period)::integer * days_per_period;
    end_date := start_date + days_per_period;
  END IF;
  INSERT INTO public.settlement_periods(schedule_id, party_type, party_id, starts_at, ends_at)
  VALUES (schedule_row.id, subject_type, subject_id,
          (start_date::timestamp AT TIME ZONE 'America/Costa_Rica'),
          (end_date::timestamp AT TIME ZONE 'America/Costa_Rica'))
  ON CONFLICT (schedule_id, party_id, starts_at) DO NOTHING;
  SELECT id INTO period_id FROM public.settlement_periods
   WHERE schedule_id = schedule_row.id AND party_id = subject_id
     AND starts_at = (start_date::timestamp AT TIME ZONE 'America/Costa_Rica') FOR UPDATE;
  IF (SELECT status FROM public.settlement_periods WHERE id = period_id) <> 'open' THEN
    RAISE EXCEPTION 'El período financiero correspondiente ya está cerrado.';
  END IF;
  INSERT INTO public.settlement_period_items(period_id, financial_record_id, original_amount, final_amount)
  VALUES (period_id, record_row.id, record_row.original_amount, record_row.amount)
  ON CONFLICT (financial_record_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_assign_financial_record_to_settlement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.assign_financial_record_to_settlement(NEW.id);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS assign_financial_record_to_settlement ON public.shipment_delivery_financial_records;
CREATE TRIGGER assign_financial_record_to_settlement AFTER INSERT ON public.shipment_delivery_financial_records
FOR EACH ROW EXECUTE FUNCTION public.trigger_assign_financial_record_to_settlement();

CREATE OR REPLACE FUNCTION public.close_settlement_period(p_period_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles profile JOIN public.companies company ON company.id = profile.company_id WHERE profile.id = auth.uid() AND profile.active AND profile.role IN ('super_admin','company_admin') AND (coalesce(company.is_owner_company,false) OR coalesce(company.is_system_company,false))) THEN RAISE EXCEPTION 'No tiene permiso para cerrar períodos.'; END IF;
  UPDATE public.settlement_periods SET status = 'closed', closed_at = now(), closed_by = auth.uid() WHERE id = p_period_id AND status = 'open';
  IF NOT FOUND THEN RAISE EXCEPTION 'El período no existe o ya está cerrado.'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_settlement_item_exclusion(p_item_id uuid, p_excluded boolean, p_reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles profile JOIN public.companies company ON company.id = profile.company_id WHERE profile.id = auth.uid() AND profile.active AND profile.role IN ('super_admin','company_admin') AND (coalesce(company.is_owner_company,false) OR coalesce(company.is_system_company,false))) THEN RAISE EXCEPTION 'No tiene permiso para modificar períodos.'; END IF;
  UPDATE public.settlement_period_items item SET excluded = p_excluded,
      exclusion_reason = CASE WHEN p_excluded THEN nullif(trim(coalesce(p_reason,'')), '') ELSE NULL END,
      excluded_by = CASE WHEN p_excluded THEN auth.uid() ELSE NULL END,
      excluded_at = CASE WHEN p_excluded THEN now() ELSE NULL END
    FROM public.settlement_periods period
   WHERE item.id = p_item_id AND period.id = item.period_id AND period.status = 'open';
  IF NOT FOUND THEN RAISE EXCEPTION 'El ítem no existe o su período está cerrado.'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_financial_record_to_settlement(uuid) FROM public;
REVOKE ALL ON FUNCTION public.close_settlement_period(uuid) FROM public;
REVOKE ALL ON FUNCTION public.set_settlement_item_exclusion(uuid, boolean, text) FROM public;
GRANT EXECUTE ON FUNCTION public.close_settlement_period(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_settlement_item_exclusion(uuid, boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_settlement_schedules()
RETURNS TABLE(id uuid, party_type text, party_id uuid, party_name text, frequency text, interval_days integer, anchor_date date, auto_rollover boolean, active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT s.id,s.party_type,s.party_id,
    CASE WHEN s.party_id IS NULL THEN 'Todos' WHEN s.party_type='company' THEN c.name ELSE p.full_name END,
    s.frequency,s.interval_days,s.anchor_date,s.auto_rollover,s.active
  FROM settlement_schedules s LEFT JOIN companies c ON c.id=s.party_id AND s.party_type='company'
  LEFT JOIN couriers co ON co.id=s.party_id AND s.party_type='courier' LEFT JOIN profiles p ON p.id=co.profile_id
  WHERE EXISTS (SELECT 1 FROM profiles pr JOIN companies own ON own.id=pr.company_id WHERE pr.id=auth.uid() AND pr.active AND pr.role IN ('super_admin','company_admin') AND (coalesce(own.is_owner_company,false) OR coalesce(own.is_system_company,false)))
  ORDER BY s.party_type,s.party_id NULLS FIRST;
$$;
CREATE OR REPLACE FUNCTION public.save_settlement_schedule(p_party_type text,p_party_id uuid,p_frequency text,p_interval_days integer,p_anchor_date date,p_auto_rollover boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE v_id uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles pr JOIN companies own ON own.id=pr.company_id WHERE pr.id=auth.uid() AND pr.active AND pr.role IN ('super_admin','company_admin') AND (coalesce(own.is_owner_company,false) OR coalesce(own.is_system_company,false))) THEN RAISE EXCEPTION 'No tiene permiso para configurar cierres.'; END IF;
  IF p_party_type NOT IN ('company','courier') OR p_frequency NOT IN ('weekly','biweekly','monthly','custom_days') THEN RAISE EXCEPTION 'Configuración no válida.'; END IF;
  INSERT INTO settlement_schedules(name,target_type,frequency_days,include_all,party_type,party_id,frequency,interval_days,anchor_date,auto_rollover,created_by)
  VALUES(
    format('%s · %s', CASE WHEN p_party_type='company' THEN 'Cierre DTS' ELSE 'Cierre mensajeros' END, CASE p_frequency WHEN 'weekly' THEN 'semanal' WHEN 'biweekly' THEN 'quincenal' WHEN 'monthly' THEN 'mensual' ELSE format('cada %s días', p_interval_days) END),
    p_party_type,
    CASE p_frequency WHEN 'weekly' THEN 7 WHEN 'biweekly' THEN 14 WHEN 'monthly' THEN 30 ELSE p_interval_days END,
    p_party_id IS NULL,
    p_party_type,p_party_id,p_frequency,CASE WHEN p_frequency='custom_days' THEN p_interval_days ELSE NULL END,p_anchor_date,p_auto_rollover,auth.uid()
  ) RETURNING id INTO v_id; RETURN v_id; END; $$;
GRANT EXECUTE ON FUNCTION public.get_settlement_schedules() TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_settlement_schedule(text,uuid,text,integer,date,boolean) TO authenticated;
NOTIFY pgrst, 'reload schema';
