-- Registra cantidades realmente entregadas y descuenta inventario de forma atómica.
ALTER TABLE public.shipment_items
  ADD COLUMN IF NOT EXISTS delivered_quantity integer NOT NULL DEFAULT 0;

ALTER TABLE public.shipment_items
  DROP CONSTRAINT IF EXISTS shipment_items_delivered_quantity_nonnegative;

ALTER TABLE public.shipment_items
  ADD CONSTRAINT shipment_items_delivered_quantity_nonnegative
  CHECK (delivered_quantity >= 0);

DROP FUNCTION IF EXISTS public.complete_shipment_delivery(
  uuid, uuid, text, numeric, numeric, text, double precision, double precision
);
DROP FUNCTION IF EXISTS public.complete_shipment_delivery(
  uuid, uuid, text, numeric, numeric, jsonb, text, double precision, double precision
);

CREATE OR REPLACE FUNCTION public.complete_shipment_delivery(
  p_shipment_id uuid,
  p_delivered_by uuid,
  p_receiver_type text,
  p_deposit_amount numeric,
  p_shipping_fee numeric,
  p_delivered_items jsonb,
  p_observations text,
  p_latitude double precision,
  p_longitude double precision
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_is_system_company boolean;
  actor_role text;
  actor_courier_id uuid;
  previous_status public.shipment_status;
  assigned_deposit numeric;
  assigned_shipping_fee numeric;
  delivery_time timestamptz := now();
  delivery_item record;
  inventory_row record;
  shipment_tracking_number text;
  shipment_company_id uuid;
  product_label text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para confirmar una entrega.';
  END IF;

  SELECT coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false), profile.role
    INTO actor_is_system_company, actor_role
    FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
   WHERE profile.id = auth.uid() AND profile.active = true;

  IF coalesce(actor_is_system_company, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Solo la empresa del sistema puede confirmar entregas.';
  END IF;

  IF actor_role = 'courier' THEN
    SELECT courier.id INTO actor_courier_id
      FROM public.couriers courier
     WHERE courier.profile_id = auth.uid() AND courier.active = true;

    IF actor_courier_id IS NULL OR p_delivered_by IS DISTINCT FROM actor_courier_id THEN
      RAISE EXCEPTION 'Un mensajero solo puede registrarse a sí mismo como quien entregó.';
    END IF;
  END IF;

  IF p_receiver_type NOT IN ('owner', 'authorized') THEN
    RAISE EXCEPTION 'El tipo de receptor no es válido.';
  END IF;

  IF p_deposit_amount IS NULL OR p_deposit_amount < 0 OR p_shipping_fee IS NULL OR p_shipping_fee < 0 THEN
    RAISE EXCEPTION 'Los montos de la entrega no son válidos.';
  END IF;

  IF length(coalesce(p_observations, '')) > 500 THEN
    RAISE EXCEPTION 'Las observaciones no pueden superar 500 caracteres.';
  END IF;

  IF (p_latitude IS NULL) <> (p_longitude IS NULL) THEN
    RAISE EXCEPTION 'Las coordenadas de la entrega están incompletas.';
  END IF;

  IF p_latitude IS NOT NULL AND (p_latitude NOT BETWEEN -90 AND 90 OR p_longitude NOT BETWEEN -180 AND 180) THEN
    RAISE EXCEPTION 'Las coordenadas de la entrega no son válidas.';
  END IF;

  IF p_delivered_items IS NULL OR jsonb_typeof(p_delivered_items) <> 'array' THEN
    RAISE EXCEPTION 'Debe indicar las cantidades entregadas de cada artículo.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer)
    WHERE d.item_id IS NULL OR d.quantity IS NULL OR d.quantity < 0
  ) THEN
    RAISE EXCEPTION 'Las cantidades entregadas deben ser enteros iguales o mayores que cero.';
  END IF;

  IF EXISTS (
    SELECT d.item_id FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer)
    GROUP BY d.item_id HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Un artículo fue enviado más de una vez en la entrega.';
  END IF;

  SELECT shipment.status, shipment.tracking_number, shipment.company_id
    INTO previous_status, shipment_tracking_number, shipment_company_id
    FROM public.shipments shipment
   WHERE shipment.id = p_shipment_id
   FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'El envío no existe.'; END IF;
  IF previous_status = 'delivered' THEN RAISE EXCEPTION 'El envío ya fue marcado como entregado.'; END IF;

  IF (SELECT count(*) FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer)) <>
     (SELECT count(*) FROM public.shipment_items WHERE shipment_id = p_shipment_id) THEN
    RAISE EXCEPTION 'Debe indicar la cantidad entregada de todos los artículos del envío.';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer)
      LEFT JOIN public.shipment_items item ON item.id = d.item_id AND item.shipment_id = p_shipment_id
     WHERE item.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Uno o más artículos no pertenecen a este envío.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.couriers courier
    JOIN public.profiles profile ON profile.id = courier.profile_id
    JOIN public.companies company ON company.id = profile.company_id
    WHERE courier.id = p_delivered_by AND courier.active = true AND profile.active = true AND profile.can_deliver = true
      AND (coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false))
  ) THEN
    RAISE EXCEPTION 'El usuario seleccionado no está habilitado para realizar entregas.';
  END IF;

  SELECT coalesce(sum(item.deposit_amount), 0), coalesce(sum(item.shipping_fee), 0)
    INTO assigned_deposit, assigned_shipping_fee
    FROM public.shipment_items item WHERE item.shipment_id = p_shipment_id;

  IF assigned_deposit = 0 AND p_deposit_amount <> 0 THEN RAISE EXCEPTION 'Este envío no tiene depósito asignado.'; END IF;
  IF assigned_shipping_fee = 0 AND p_shipping_fee <> 0 THEN RAISE EXCEPTION 'Este envío no tiene costo de envío asignado.'; END IF;

  FOR delivery_item IN
    SELECT item.id, item.product_id, d.quantity
      FROM public.shipment_items item
      JOIN jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer) ON d.item_id = item.id
     WHERE item.shipment_id = p_shipment_id
  LOOP
    IF delivery_item.quantity > 0 THEN
      SELECT inventory.id, inventory.quantity
        INTO inventory_row
        FROM public.inventory inventory
       WHERE inventory.courier_id = p_delivered_by
         AND inventory.company_id = shipment_company_id
         AND inventory.product_id = delivery_item.product_id
       FOR UPDATE;

      IF inventory_row.id IS NULL THEN
        INSERT INTO public.inventory (courier_id, company_id, product_id, quantity, low_stock, medium_stock, updated_at)
        VALUES (p_delivered_by, shipment_company_id, delivery_item.product_id, -delivery_item.quantity, 5, 10, delivery_time)
        RETURNING id, quantity INTO inventory_row;
      ELSE
        UPDATE public.inventory
           SET quantity = inventory_row.quantity - delivery_item.quantity, updated_at = delivery_time
         WHERE id = inventory_row.id
        RETURNING quantity INTO inventory_row.quantity;
      END IF;

      INSERT INTO public.inventory_movements (inventory_id, quantity_before, quantity_change, quantity_after, reason, notes, created_by)
      VALUES (
        inventory_row.id,
        inventory_row.quantity + delivery_item.quantity,
        -delivery_item.quantity,
        inventory_row.quantity,
        'Entrega de envío',
        format('Guía %s · Cantidad entregada: %s', shipment_tracking_number, delivery_item.quantity),
        auth.uid()
      );
    END IF;

    UPDATE public.shipment_items SET delivered_quantity = delivery_item.quantity WHERE id = delivery_item.id;
  END LOOP;

  UPDATE public.shipments
     SET status = 'delivered', delivered_at = delivery_time, delivered_by_courier_id = p_delivered_by,
         receiver_type = p_receiver_type::public.receiver_type,
         deposit_collected = CASE WHEN assigned_deposit > 0 THEN p_deposit_amount ELSE 0 END,
         shipping_collected = CASE WHEN assigned_shipping_fee > 0 THEN p_shipping_fee ELSE 0 END,
         latitude = p_latitude, longitude = p_longitude, last_update_at = delivery_time,
         last_update_message = CASE WHEN p_latitude IS NULL THEN 'Entrega confirmada sin ubicación GPS' ELSE 'Entrega confirmada' END
   WHERE id = p_shipment_id;

  INSERT INTO public.shipment_status_history (shipment_id, previous_status, status, notes, created_by)
  VALUES (p_shipment_id, previous_status, 'delivered',
    nullif(concat_ws(' · ', nullif(trim(coalesce(p_observations, '')), ''), CASE WHEN p_latitude IS NULL THEN 'Ubicación de entrega no disponible' ELSE NULL END), ''), auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.complete_shipment_delivery(uuid, uuid, text, numeric, numeric, jsonb, text, double precision, double precision) FROM public;
GRANT EXECUTE ON FUNCTION public.complete_shipment_delivery(uuid, uuid, text, numeric, numeric, jsonb, text, double precision, double precision) TO authenticated;

NOTIFY pgrst, 'reload schema';
