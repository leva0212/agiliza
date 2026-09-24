BEGIN;

-- La ruta se crea activa por defecto. Desactivar una ruta no borra su configuración.
ALTER TABLE public.routes
  ALTER COLUMN active SET DEFAULT true;

UPDATE public.routes
SET active = true
WHERE active IS NULL;

ALTER TABLE public.routes
  ALTER COLUMN active SET NOT NULL;

-- Esta es la única función que necesitaba corrección.
-- Cuenta cada barrio una vez, entre todas las rutas activas que lo cubren.
CREATE OR REPLACE FUNCTION public.get_province_coverage_counts(p_province text)
RETURNS TABLE (
  district_id bigint,
  canton text,
  district text,
  covered_count bigint,
  min_hours integer,
  max_hours integer,
  visit_days text[]
)
LANGUAGE sql
AS $$
  WITH province_districts AS (
    SELECT d.id AS district_id, c.name::text AS canton, d.name::text AS district
    FROM public.districts d
    JOIN public.cantons c ON c.id = d.canton_id
    JOIN public.provinces p ON p.id = c.province_id
    WHERE p.name = p_province
  ), active_coverage AS (
    SELECT n.district_id, count(DISTINCT rc.neighborhood_id)::bigint AS covered_count
    FROM public.route_coverage rc
    JOIN public.routes r ON r.id = rc.route_id AND r.active = true
    JOIN public.neighborhoods n ON n.id = rc.neighborhood_id
    GROUP BY n.district_id
  ), active_times AS (
    SELECT rdt.district_id,
      min(rdt.min_hours)::integer AS min_hours,
      max(rdt.max_hours)::integer AS max_hours
    FROM public.route_district_delivery_times rdt
    JOIN public.routes r ON r.id = rdt.route_id AND r.active = true
    GROUP BY rdt.district_id
  ), active_days AS (
    SELECT rvd.district_id,
      array_agg(DISTINCT rvd.day::text ORDER BY rvd.day::text) AS visit_days
    FROM public.route_district_visit_days rvd
    JOIN public.routes r ON r.id = rvd.route_id AND r.active = true
    GROUP BY rvd.district_id
  )
  SELECT pd.district_id, pd.canton, pd.district,
    coalesce(ac.covered_count, 0::bigint),
    coalesce(at.min_hours, 0),
    coalesce(at.max_hours, 0),
    coalesce(ad.visit_days, ARRAY[]::text[])
  FROM province_districts pd
  LEFT JOIN active_coverage ac ON ac.district_id = pd.district_id
  LEFT JOIN active_times at ON at.district_id = pd.district_id
  LEFT JOIN active_days ad ON ad.district_id = pd.district_id
  ORDER BY pd.canton, pd.district;
$$;

GRANT EXECUTE ON FUNCTION public.get_province_coverage_counts(text) TO authenticated;

COMMIT;