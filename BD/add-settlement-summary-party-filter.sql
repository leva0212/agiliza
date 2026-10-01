-- Filtro opcional por DTS o mensajero para los totales de períodos abiertos.
CREATE OR REPLACE FUNCTION public.get_open_settlement_summaries_filtered(
  p_party_type text,
  p_filter_party_id uuid DEFAULT NULL
)
RETURNS TABLE(
  period_id uuid,
  party_name text,
  starts_at timestamptz,
  ends_at timestamptz,
  total_entregas numeric,
  total_envios_cobrados numeric,
  total_depositos numeric,
  pagos_extra numeric,
  total_deducciones numeric,
  total_liquidacion numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH authorized AS (
    SELECT 1
    FROM profiles profile
    JOIN companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid()
      AND profile.active
      AND profile.role IN ('super_admin','company_admin')
      AND (coalesce(company.is_owner_company,false) OR coalesce(company.is_system_company,false))
  ), base AS (
    SELECT period.id AS settlement_period_id, period.starts_at, period.ends_at,
      financial.company_id, financial.courier_id, financial.company_name, financial.courier_name,
      financial.operation_type, financial.amount, financial.shipment_id
    FROM settlement_periods period
    JOIN settlement_period_items item ON item.period_id = period.id
    JOIN shipment_delivery_financial_records financial ON financial.id = item.financial_record_id
    WHERE EXISTS (SELECT 1 FROM authorized)
      AND period.status = 'open'
      AND period.party_type = p_party_type
      AND (p_filter_party_id IS NULL OR period.party_id = p_filter_party_id)
      AND NOT item.excluded
  ), sums AS (
    SELECT base.settlement_period_id,
      max(base.starts_at) AS starts_at,
      max(base.ends_at) AS ends_at,
      max(CASE WHEN p_party_type = 'company' THEN base.company_name ELSE base.courier_name END) AS party_name,
      coalesce(sum(base.amount), 0) AS total_entregas,
      coalesce(sum(CASE WHEN base.operation_type = 'delivery' THEN shipment.shipping_collected ELSE 0 END), 0) AS total_envios,
      coalesce(sum(CASE WHEN base.operation_type = 'delivery' THEN shipment.deposit_collected ELSE 0 END), 0) AS total_depositos
    FROM base
    LEFT JOIN shipments shipment ON shipment.id = base.shipment_id
    GROUP BY base.settlement_period_id
  ), adjustments AS (
    SELECT adjustment.period_id,
      coalesce(sum(adjustment.amount) FILTER (WHERE adjustment.adjustment_type = 'extra'), 0) AS extra,
      coalesce(sum(adjustment.amount) FILTER (WHERE adjustment.adjustment_type = 'deduction'), 0) AS deduction
    FROM settlement_adjustments adjustment
    GROUP BY adjustment.period_id
  )
  SELECT sums.settlement_period_id, sums.party_name, sums.starts_at, sums.ends_at,
    sums.total_entregas, sums.total_envios, sums.total_depositos,
    coalesce(adjustments.extra, 0), coalesce(adjustments.deduction, 0),
    sums.total_entregas - sums.total_envios - sums.total_depositos
      + coalesce(adjustments.extra, 0) - coalesce(adjustments.deduction, 0)
  FROM sums
  LEFT JOIN adjustments ON adjustments.period_id = sums.settlement_period_id
  ORDER BY sums.party_name;
$$;

GRANT EXECUTE ON FUNCTION public.get_open_settlement_summaries_filtered(text, uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';
