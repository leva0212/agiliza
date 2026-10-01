BEGIN;

INSERT INTO public.permissions (id, description)
VALUES ('view_own_income', 'Puede ver sus ingresos')
ON CONFLICT (id) DO UPDATE
SET description = EXCLUDED.description;

CREATE OR REPLACE FUNCTION public.get_my_unsettled_income_summary()
RETURNS TABLE(
  period_starts_at timestamptz,
  period_ends_at timestamptz,
  deliveries_count bigint,
  delivery_income numeric,
  deposits_collected numeric,
  shipping_collected numeric,
  net_amount numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_courier_id uuid;
BEGIN
  SELECT courier.id
  INTO v_courier_id
  FROM public.profiles profile
  JOIN public.couriers courier ON courier.profile_id = profile.id
  WHERE profile.id = auth.uid()
    AND profile.active = true
    AND profile.can_deliver = true
    AND EXISTS (
      SELECT 1
      FROM public.profile_permissions permission
      WHERE permission.profile_id = profile.id
        AND permission.permission_id = 'view_own_income'
    );

  IF v_courier_id IS NULL THEN
    RAISE EXCEPTION 'No tiene permiso para consultar sus ingresos.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH pending_records AS (
    SELECT
      financial.operation_type,
      financial.amount,
      financial.shipment_id,
      period.starts_at,
      period.ends_at
    FROM public.shipment_delivery_financial_records financial
    LEFT JOIN public.settlement_period_items item
      ON item.financial_record_id = financial.id
    LEFT JOIN public.settlement_periods period
      ON period.id = item.period_id
    WHERE financial.courier_id = v_courier_id
      AND financial.record_type = 'courier_delivery_payment'
      AND financial.status IN ('pending', 'unrated')
      AND coalesce(item.excluded, false) = false
      AND (period.id IS NULL OR period.status = 'open')
  )
  SELECT
    min(pending_records.starts_at),
    max(pending_records.ends_at),
    count(*),
    coalesce(sum(pending_records.amount), 0),
    coalesce(sum(shipment.deposit_collected) FILTER (WHERE pending_records.operation_type = 'delivery'), 0),
    coalesce(sum(shipment.shipping_collected) FILTER (WHERE pending_records.operation_type = 'delivery'), 0),
    coalesce(sum(pending_records.amount), 0)
      - coalesce(sum(shipment.deposit_collected) FILTER (WHERE pending_records.operation_type = 'delivery'), 0)
      - coalesce(sum(shipment.shipping_collected) FILTER (WHERE pending_records.operation_type = 'delivery'), 0)
  FROM pending_records
  LEFT JOIN public.shipments shipment ON shipment.id = pending_records.shipment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_unsettled_income_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_unsettled_income_summary() TO authenticated;

-- Versión nueva del reporte: mantiene la función anterior para compatibilidad y
-- expone el tipo de operación para distinguir entregas de intentos fallidos.
CREATE OR REPLACE FUNCTION public.get_delivery_financial_records_page_v2(
  p_record_type text,
  p_company text DEFAULT NULL,
  p_courier text DEFAULT NULL,
  p_route text DEFAULT NULL,
  p_tracking_number text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_from timestamptz DEFAULT NULL,
  p_to timestamptz DEFAULT NULL,
  p_limit integer DEFAULT 25,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  shipment_id uuid,
  occurred_at timestamptz,
  operation_type text,
  tracking_number text,
  customer_name text,
  company_name text,
  courier_name text,
  route_name text,
  rate_scope text,
  amount numeric,
  status text,
  total_count bigint,
  total_amount numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_record_type NOT IN ('company_delivery_charge', 'courier_delivery_payment') THEN
    RAISE EXCEPTION 'El tipo de reporte no es válido.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid()
      AND profile.active = true
      AND profile.role IN ('super_admin', 'company_admin')
      AND (coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para consultar reportes financieros.';
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT record.*
    FROM public.shipment_delivery_financial_records record
    WHERE record.record_type = p_record_type
      AND (p_company IS NULL OR coalesce(record.company_name, '') ILIKE '%' || p_company || '%')
      AND (p_courier IS NULL OR coalesce(record.courier_name, '') ILIKE '%' || p_courier || '%')
      AND (p_route IS NULL OR coalesce(record.route_name, '') ILIKE '%' || p_route || '%')
      AND (p_tracking_number IS NULL OR record.tracking_number ILIKE '%' || p_tracking_number || '%')
      AND (p_status IS NULL OR record.status = p_status)
      AND (p_from IS NULL OR record.occurred_at >= p_from)
      AND (p_to IS NULL OR record.occurred_at <= p_to)
  )
  SELECT record.id, record.shipment_id, record.occurred_at, record.operation_type,
    record.tracking_number, record.customer_name, record.company_name,
    record.courier_name, record.route_name, record.rate_scope, record.amount,
    record.status, count(*) OVER (), coalesce(sum(record.amount) OVER (), 0)
  FROM filtered record
  ORDER BY record.occurred_at DESC, record.created_at DESC
  LIMIT greatest(p_limit, 1)
  OFFSET greatest(p_offset, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.get_delivery_financial_records_page_v2(text, text, text, text, text, text, timestamptz, timestamptz, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_delivery_financial_records_page_v2(text, text, text, text, text, text, timestamptz, timestamptz, integer, integer) TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
