-- Listado paginado de movimientos. Los filtros y el rango de fechas se resuelven en la BD.
CREATE OR REPLACE FUNCTION public.get_inventory_movements_page(
  p_company text DEFAULT NULL, p_courier text DEFAULT NULL, p_product text DEFAULT NULL,
  p_search text DEFAULT NULL, p_movement_type text DEFAULT NULL,
  p_from timestamptz DEFAULT NULL, p_to timestamptz DEFAULT NULL,
  p_limit integer DEFAULT 25, p_offset integer DEFAULT 0
)
RETURNS TABLE(id uuid, created_at timestamptz, quantity_before integer, quantity_change integer, quantity_after integer, reason text, notes text, company_name text, courier_name text, product_name text, total_count bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  WITH filtered AS (
    SELECT m.*, c.name AS company_name, profile.full_name AS courier_name, p.name AS product_name
    FROM public.inventory_movements m
    JOIN public.inventory i ON i.id = m.inventory_id
    LEFT JOIN public.companies c ON c.id = i.company_id
    LEFT JOIN public.products p ON p.id = i.product_id
    LEFT JOIN public.couriers courier ON courier.id = i.courier_id
    LEFT JOIN public.profiles profile ON profile.id = courier.profile_id
    WHERE (p_company IS NULL OR c.name ILIKE '%' || p_company || '%')
      AND (p_courier IS NULL OR profile.full_name ILIKE '%' || p_courier || '%')
      AND (p_product IS NULL OR p.name ILIKE '%' || p_product || '%')
      AND (p_search IS NULL OR m.reason ILIKE '%' || p_search || '%' OR coalesce(m.notes,'') ILIKE '%' || p_search || '%')
      AND (p_movement_type IS NULL OR (p_movement_type = 'entry' AND m.quantity_change > 0) OR (p_movement_type = 'exit' AND m.quantity_change < 0))
      AND (p_from IS NULL OR m.created_at >= p_from)
      AND (p_to IS NULL OR m.created_at <= p_to)
  )
  SELECT id, created_at, quantity_before, quantity_change, quantity_after, reason, notes, company_name, courier_name, product_name, count(*) over()
  FROM filtered ORDER BY created_at DESC LIMIT greatest(p_limit,1) OFFSET greatest(p_offset,0);
$$;
REVOKE ALL ON FUNCTION public.get_inventory_movements_page(text,text,text,text,text,timestamptz,timestamptz,integer,integer) FROM public;
GRANT EXECUTE ON FUNCTION public.get_inventory_movements_page(text,text,text,text,text,timestamptz,timestamptz,integer,integer) TO authenticated;
NOTIFY pgrst, 'reload schema';
