en DROP FUNCTION IF EXISTS public.get_filtered_shipment_ids(uuid, uuid, integer, text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.get_filtered_shipment_ids(
  p_company_id uuid DEFAULT NULL,
  p_route_id uuid DEFAULT NULL,
  p_courier_id uuid DEFAULT NULL,
  p_delivery_hours integer DEFAULT NULL,
  p_visit_day text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (id uuid, total_count bigint)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  WITH filtered AS (
    SELECT s.id, s.created_at
    FROM public.shipments s
    WHERE (p_company_id IS NULL OR s.company_id = p_company_id)
      AND (p_route_id IS NULL OR s.route_id = p_route_id)
      AND (
        p_courier_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.couriers courier
          WHERE courier.id = p_courier_id
            AND courier.profile_id = s.courier_id
        )
        OR EXISTS (
          SELECT 1
          FROM public.courier_routes courier_route
          WHERE courier_route.route_id = s.route_id
            AND courier_route.courier_id = p_courier_id
        )
      )
      AND (p_status IS NULL OR s.status::text = p_status)
      AND (p_search IS NULL OR s.search_text ILIKE '%' || p_search || '%')
      AND (
        p_delivery_hours IS NULL OR EXISTS (
          SELECT 1
          FROM public.route_district_delivery_times rdt
          WHERE rdt.route_id = s.route_id
            AND rdt.district_id = s.district_id
            AND rdt.min_hours = p_delivery_hours
        )
      )
      AND (
        p_visit_day IS NULL OR EXISTS (
          SELECT 1
          FROM public.route_district_visit_days rvd
          WHERE rvd.route_id = s.route_id
            AND rvd.district_id = s.district_id
            AND rvd.day::text = p_visit_day
        )
      )
  )
  SELECT filtered.id, count(*) OVER () AS total_count
  FROM filtered
  ORDER BY filtered.created_at DESC
  LIMIT GREATEST(p_limit, 1)
  OFFSET GREATEST(p_offset, 0);
$$;

GRANT EXECUTE ON FUNCTION public.get_filtered_shipment_ids(uuid, uuid, uuid, integer, text, text, text, integer, integer) TO authenticated;

