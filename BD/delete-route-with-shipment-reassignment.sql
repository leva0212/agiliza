-- Eliminación atómica de rutas con reasignación opcional de envíos.
-- Solo permite la acción al superadministrador autenticado y activo.
CREATE OR REPLACE FUNCTION public.delete_route_with_optional_shipment_reassignment(
  p_route_id uuid,
  p_successor_route_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_route_name text;
  v_successor_route_name text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND active = true AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'No autorizado para eliminar rutas.';
  END IF;

  SELECT name INTO v_old_route_name FROM routes WHERE id = p_route_id;
  IF v_old_route_name IS NULL THEN
    RAISE EXCEPTION 'Ruta no encontrada.';
  END IF;

  IF p_successor_route_id = p_route_id THEN
    RAISE EXCEPTION 'La ruta destino debe ser diferente de la ruta eliminada.';
  END IF;
  IF p_successor_route_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM routes WHERE id = p_successor_route_id AND active = true
  ) THEN
    RAISE EXCEPTION 'La ruta destino no existe o está inactiva.';
  END IF;
  IF p_successor_route_id IS NOT NULL THEN
    SELECT name INTO v_successor_route_name FROM routes WHERE id = p_successor_route_id;

    INSERT INTO shipment_status_history (shipment_id, previous_status, status, notes, created_by)
    SELECT id, status, status,
      format('Ruta reasignada de "%s" a "%s" al eliminar la ruta original.', v_old_route_name, v_successor_route_name),
      auth.uid()
    FROM shipments
    WHERE route_id = p_route_id;

    UPDATE shipments SET route_id = p_successor_route_id WHERE route_id = p_route_id;
  END IF;
  DELETE FROM routes WHERE id = p_route_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.delete_route_with_optional_shipment_reassignment(uuid, uuid) TO authenticated;