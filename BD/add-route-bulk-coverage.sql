-- Agrega todos los barrios de los distritos seleccionados sin eliminar cobertura existente.
CREATE OR REPLACE FUNCTION public.add_route_bulk_coverage(p_route_id uuid, p_district_ids bigint[])
RETURNS TABLE(added_neighborhoods integer, affected_districts integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_added integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND active = true AND role = 'super_admin') THEN RAISE EXCEPTION 'No autorizado para modificar cobertura de rutas.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM routes WHERE id = p_route_id) THEN RAISE EXCEPTION 'Ruta no encontrada.'; END IF;
  WITH targets AS (SELECT DISTINCT unnest(p_district_ids) AS id), inserted AS (
    INSERT INTO route_coverage (route_id, neighborhood_id)
    SELECT p_route_id, n.id FROM neighborhoods n JOIN targets t ON t.id = n.district_id
    ON CONFLICT (route_id, neighborhood_id) DO NOTHING RETURNING neighborhood_id
  ) SELECT count(*) INTO v_added FROM inserted;
  RETURN QUERY SELECT v_added, (SELECT count(*)::integer FROM (SELECT DISTINCT unnest(p_district_ids)) t);
END; $$;
GRANT EXECUTE ON FUNCTION public.add_route_bulk_coverage(uuid, bigint[]) TO authenticated;
-- Variante que combina distritos completos y barrios personalizados.
CREATE OR REPLACE FUNCTION public.add_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[])
RETURNS TABLE(added_neighborhoods integer, affected_districts integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_added integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND active = true AND role = 'super_admin') THEN RAISE EXCEPTION 'No autorizado para modificar cobertura de rutas.'; END IF;
  WITH targets AS (SELECT DISTINCT unnest(coalesce(p_district_ids, '{}'::bigint[])) AS id), chosen AS (
    SELECT n.id FROM neighborhoods n JOIN targets t ON t.id = n.district_id
    UNION SELECT DISTINCT n.id FROM neighborhoods n WHERE n.id = ANY(coalesce(p_neighborhood_ids, '{}'::bigint[]))
  ), inserted AS (
    INSERT INTO route_coverage(route_id, neighborhood_id) SELECT p_route_id, id FROM chosen ON CONFLICT(route_id, neighborhood_id) DO NOTHING RETURNING neighborhood_id
  ) SELECT count(*) INTO v_added FROM inserted;
  RETURN QUERY SELECT v_added, (SELECT count(DISTINCT district_id)::integer FROM neighborhoods WHERE id = ANY(coalesce(p_neighborhood_ids, '{}'::bigint[])) OR district_id = ANY(coalesce(p_district_ids, '{}'::bigint[])));
END; $$;
GRANT EXECUTE ON FUNCTION public.add_route_bulk_coverage_with_neighborhoods(uuid, bigint[], bigint[]) TO authenticated;

-- Quita cobertura de la ruta actual; no modifica barrios ni otras rutas.
CREATE OR REPLACE FUNCTION public.remove_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[])
RETURNS TABLE(removed_neighborhoods integer, affected_districts integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_removed integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND active = true AND role = 'super_admin') THEN RAISE EXCEPTION 'No autorizado para modificar cobertura de rutas.'; END IF;
  WITH targets AS (SELECT DISTINCT unnest(coalesce(p_district_ids, '{}'::bigint[])) AS id), removed AS (
    DELETE FROM route_coverage rc USING neighborhoods n
    WHERE rc.route_id = p_route_id AND rc.neighborhood_id = n.id
      AND (n.district_id IN (SELECT id FROM targets) OR n.id = ANY(coalesce(p_neighborhood_ids, '{}'::bigint[])))
    RETURNING n.district_id
  ) SELECT count(*) INTO v_removed FROM removed;
  DELETE FROM route_district_delivery_times WHERE route_id=p_route_id AND district_id=ANY(coalesce(p_district_ids, '{}'::bigint[]));
  DELETE FROM route_district_visit_days WHERE route_id=p_route_id AND district_id=ANY(coalesce(p_district_ids, '{}'::bigint[]));
  RETURN QUERY SELECT v_removed, (SELECT count(DISTINCT district_id)::integer FROM neighborhoods WHERE id = ANY(coalesce(p_neighborhood_ids, '{}'::bigint[])) OR district_id = ANY(coalesce(p_district_ids, '{}'::bigint[])));
END; $$;
GRANT EXECUTE ON FUNCTION public.remove_route_bulk_coverage_with_neighborhoods(uuid, bigint[], bigint[]) TO authenticated;
