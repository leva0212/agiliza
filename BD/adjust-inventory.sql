-- Ajuste transaccional: inventario y movimiento se confirman juntos o se revierten juntos.
CREATE OR REPLACE FUNCTION public.adjust_inventory(
  p_courier_id uuid,
  p_company_id uuid,
  p_product_id uuid,
  p_quantity_change integer,
  p_low_stock integer,
  p_medium_stock integer,
  p_reason text,
  p_notes text DEFAULT NULL,
  p_created_by uuid DEFAULT NULL
)
RETURNS TABLE(inventory_id uuid, quantity_after integer)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_inventory public.inventory%ROWTYPE;
  next_quantity integer;
BEGIN
  IF p_quantity_change = 0 THEN RAISE EXCEPTION 'El ajuste debe cambiar la cantidad.'; END IF;
  IF p_low_stock < 0 OR p_medium_stock <= p_low_stock THEN RAISE EXCEPTION 'Los niveles de alerta no son válidos.'; END IF;

  SELECT * INTO current_inventory
  FROM public.inventory
  WHERE courier_id = p_courier_id AND company_id = p_company_id AND product_id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.inventory (courier_id, company_id, product_id, quantity, low_stock, medium_stock)
    VALUES (p_courier_id, p_company_id, p_product_id, p_quantity_change, p_low_stock, p_medium_stock)
    RETURNING * INTO current_inventory;

    INSERT INTO public.inventory_movements (inventory_id, quantity_before, quantity_change, quantity_after, reason, notes, created_by)
    VALUES (current_inventory.id, 0, p_quantity_change, p_quantity_change, p_reason, nullif(trim(coalesce(p_notes, '')), ''), p_created_by);
  ELSE
    next_quantity := current_inventory.quantity + p_quantity_change;
    UPDATE public.inventory
      SET quantity = next_quantity, low_stock = p_low_stock, medium_stock = p_medium_stock, updated_at = now()
      WHERE id = current_inventory.id;

    INSERT INTO public.inventory_movements (inventory_id, quantity_before, quantity_change, quantity_after, reason, notes, created_by)
    VALUES (current_inventory.id, current_inventory.quantity, p_quantity_change, next_quantity, p_reason, nullif(trim(coalesce(p_notes, '')), ''), p_created_by);
  END IF;

  RETURN QUERY SELECT current_inventory.id, coalesce(next_quantity, p_quantity_change);
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_inventory(uuid, uuid, uuid, integer, integer, integer, text, text, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.adjust_inventory(uuid, uuid, uuid, integer, integer, integer, text, text, uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';
