-- Actualiza en bloque los tiempos y días de visita de distritos ya cubiertos por una ruta.
-- No modifica route_coverage ni los barrios asociados.
CREATE OR REPLACE FUNCTION public.apply_route_bulk_schedule(
  p_route_id uuid,
  p_district_ids bigint[],
  p_min_hours integer,
  p_max_hours integer,
  p_days text[]
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND active = true AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'No autorizado para modificar configuraciones de rutas.';
  END IF;

  IF p_min_hours NOT IN (0, 24, 48, 72) OR p_max_hours NOT IN (0, 24, 48, 72, 96) THEN
    RAISE EXCEPTION 'El tiempo seleccionado no es válido.';
  END IF;

  WITH target_districts AS (
    SELECT DISTINCT district_id
    FROM unnest(p_district_ids) AS district_id
  )
  SELECT count(*) INTO v_count
  FROM target_districts target
  WHERE EXISTS (
    SELECT 1
    FROM route_coverage coverage
    JOIN neighborhoods neighborhood ON neighborhood.id = coverage.neighborhood_id
    WHERE coverage.route_id = p_route_id
      AND neighborhood.district_id = target.district_id
  );

  IF v_count <> cardinality(ARRAY(SELECT DISTINCT unnest(p_district_ids))) THEN
    RAISE EXCEPTION 'Uno o más distritos no tienen cobertura en esta ruta.';
  END IF;

  DELETE FROM route_district_delivery_times
  WHERE route_id = p_route_id AND district_id = ANY(p_district_ids);

  DELETE FROM route_district_visit_days
  WHERE route_id = p_route_id AND district_id = ANY(p_district_ids);

  INSERT INTO route_district_delivery_times (route_id, district_id, min_hours, max_hours)
  SELECT p_route_id, district_id, p_min_hours, CASE WHEN p_min_hours = 0 THEN 0 ELSE p_max_hours END
  FROM (SELECT DISTINCT unnest(p_district_ids) AS district_id) targets;

  IF cardinality(p_days) > 0 THEN
    INSERT INTO route_district_visit_days (route_id, district_id, day)
    SELECT p_route_id, target.district_id, day_value
    FROM (SELECT DISTINCT unnest(p_district_ids) AS district_id) target
    CROSS JOIN unnest(p_days) AS day_value;
  END IF;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_route_bulk_schedule(uuid, bigint[], integer, integer, text[]) TO authenticated;