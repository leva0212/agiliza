-- Registros financieros inmutables generados al confirmar una entrega.
-- Cada entrega crea: un cobro a la empresa dueña del envío y un pago al mensajero.
-- Las tarifas son una referencia; el monto queda congelado para reportes y cierres.

CREATE TABLE IF NOT EXISTS public.shipment_delivery_financial_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE RESTRICT,
  operation_type text NOT NULL DEFAULT 'delivery' CHECK (operation_type IN ('delivery', 'failed_attempt')),
  record_type text NOT NULL CHECK (record_type IN ('company_delivery_charge', 'courier_delivery_payment')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'voided', 'unrated')),
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  courier_id uuid REFERENCES public.couriers(id) ON DELETE SET NULL,
  route_id uuid REFERENCES public.routes(id) ON DELETE SET NULL,
  delivery_rate_id uuid REFERENCES public.delivery_rates(id) ON DELETE SET NULL,
  courier_delivery_rate_id uuid REFERENCES public.courier_delivery_rates(id) ON DELETE SET NULL,
  tracking_number text NOT NULL,
  customer_name text,
  company_name text,
  courier_name text,
  route_name text,
  rate_scope text,
  original_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (original_amount >= 0),
  amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'CRC' CHECK (currency = 'CRC'),
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE (event_id, record_type)
);

-- Compatibilidad con ejecuciones previas de esta migración en ambientes de prueba.
ALTER TABLE public.shipment_delivery_financial_records
  ADD COLUMN IF NOT EXISTS event_id uuid,
  ADD COLUMN IF NOT EXISTS operation_type text NOT NULL DEFAULT 'delivery',
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS original_amount numeric(14,2) NOT NULL DEFAULT 0;
UPDATE public.shipment_delivery_financial_records record
   SET event_id = coalesce(record.event_id, gen_random_uuid()),
       customer_name = coalesce(record.customer_name, shipment.customer_name),
       original_amount = CASE WHEN record.original_amount = 0 THEN record.amount ELSE record.original_amount END
  FROM public.shipments shipment
 WHERE shipment.id = record.shipment_id
   AND (record.event_id IS NULL OR record.customer_name IS NULL OR record.original_amount = 0);
ALTER TABLE public.shipment_delivery_financial_records
  ALTER COLUMN event_id SET NOT NULL;
ALTER TABLE public.shipment_delivery_financial_records
  DROP CONSTRAINT IF EXISTS shipment_delivery_financial_records_shipment_id_record_type_key;
CREATE UNIQUE INDEX IF NOT EXISTS shipment_delivery_financial_records_event_record_idx
  ON public.shipment_delivery_financial_records (event_id, record_type);

CREATE INDEX IF NOT EXISTS shipment_delivery_financial_records_company_occurred_idx
  ON public.shipment_delivery_financial_records (company_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS shipment_delivery_financial_records_courier_occurred_idx
  ON public.shipment_delivery_financial_records (courier_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS shipment_delivery_financial_records_status_occurred_idx
  ON public.shipment_delivery_financial_records (status, occurred_at DESC);
CREATE INDEX IF NOT EXISTS shipment_delivery_financial_records_shipment_occurred_idx
  ON public.shipment_delivery_financial_records (shipment_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.shipment_delivery_financial_amount_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_record_id uuid NOT NULL REFERENCES public.shipment_delivery_financial_records(id) ON DELETE RESTRICT,
  previous_amount numeric(14,2) NOT NULL CHECK (previous_amount >= 0),
  new_amount numeric(14,2) NOT NULL CHECK (new_amount >= 0),
  justification text NOT NULL CHECK (length(trim(justification)) BETWEEN 1 AND 500),
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shipment_delivery_financial_amount_changes_record_idx
  ON public.shipment_delivery_financial_amount_changes (financial_record_id, changed_at DESC);

ALTER TABLE public.shipment_delivery_financial_amount_changes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.shipment_delivery_financial_records ENABLE ROW LEVEL SECURITY;

-- Se conserva la firma RPC que ya utiliza la aplicación.
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
  shipment_route_id uuid;
  shipment_neighborhood_id bigint;
  resolved_district_id bigint;
  resolved_canton_id bigint;
  resolved_province_id bigint;
  shipment_company_name text;
  shipment_customer_name text;
  company_default_charge numeric;
  shipment_route_name text;
  delivered_courier_name text;
  courier_default_pay numeric;
  company_rate_id uuid;
  company_rate_amount numeric;
  company_rate_scope text;
  courier_rate_id uuid;
  courier_rate_amount numeric;
  courier_rate_scope text;
  financial_event_id uuid := gen_random_uuid();
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debe iniciar sesión para confirmar una entrega.'; END IF;

  SELECT coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false), profile.role
    INTO actor_is_system_company, actor_role
    FROM public.profiles profile JOIN public.companies company ON company.id = profile.company_id
   WHERE profile.id = auth.uid() AND profile.active = true;
  IF coalesce(actor_is_system_company, false) IS NOT TRUE THEN RAISE EXCEPTION 'Solo la empresa del sistema puede confirmar entregas.'; END IF;

  IF actor_role = 'courier' THEN
    SELECT courier.id INTO actor_courier_id FROM public.couriers courier WHERE courier.profile_id = auth.uid() AND courier.active = true;
    IF actor_courier_id IS NULL OR p_delivered_by IS DISTINCT FROM actor_courier_id THEN RAISE EXCEPTION 'Un mensajero solo puede registrarse a sí mismo como quien entregó.'; END IF;
  END IF;
  IF p_receiver_type NOT IN ('owner', 'authorized') THEN RAISE EXCEPTION 'El tipo de receptor no es válido.'; END IF;
  IF p_deposit_amount IS NULL OR p_deposit_amount < 0 OR p_shipping_fee IS NULL OR p_shipping_fee < 0 THEN RAISE EXCEPTION 'Los montos de la entrega no son válidos.'; END IF;
  IF length(coalesce(p_observations, '')) > 500 THEN RAISE EXCEPTION 'Las observaciones no pueden superar 500 caracteres.'; END IF;
  IF (p_latitude IS NULL) <> (p_longitude IS NULL) THEN RAISE EXCEPTION 'Las coordenadas de la entrega están incompletas.'; END IF;
  IF p_latitude IS NOT NULL AND (p_latitude NOT BETWEEN -90 AND 90 OR p_longitude NOT BETWEEN -180 AND 180) THEN RAISE EXCEPTION 'Las coordenadas de la entrega no son válidas.'; END IF;
  IF p_delivered_items IS NULL OR jsonb_typeof(p_delivered_items) <> 'array' THEN RAISE EXCEPTION 'Debe indicar las cantidades entregadas de cada artículo.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer) WHERE d.item_id IS NULL OR d.quantity IS NULL OR d.quantity < 0) THEN RAISE EXCEPTION 'Las cantidades entregadas deben ser enteros iguales o mayores que cero.'; END IF;
  IF EXISTS (SELECT d.item_id FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer) GROUP BY d.item_id HAVING count(*) > 1) THEN RAISE EXCEPTION 'Un artículo fue enviado más de una vez en la entrega.'; END IF;

  SELECT shipment.status, shipment.tracking_number, shipment.company_id, shipment.route_id,
         shipment.neighborhood_id, coalesce(neighborhood.district_id, shipment.district_id), district.canton_id, canton.province_id,
         company.name, shipment.customer_name, company.delivery_charge, route.name
    INTO previous_status, shipment_tracking_number, shipment_company_id, shipment_route_id,
         shipment_neighborhood_id, resolved_district_id, resolved_canton_id, resolved_province_id,
         shipment_company_name, shipment_customer_name, company_default_charge, shipment_route_name
    FROM public.shipments shipment
    JOIN public.companies company ON company.id = shipment.company_id
    LEFT JOIN public.routes route ON route.id = shipment.route_id
    LEFT JOIN public.neighborhoods neighborhood ON neighborhood.id = shipment.neighborhood_id
    LEFT JOIN public.districts district ON district.id = coalesce(neighborhood.district_id, shipment.district_id)
    LEFT JOIN public.cantons canton ON canton.id = district.canton_id
   WHERE shipment.id = p_shipment_id FOR UPDATE OF shipment;
  IF NOT FOUND THEN RAISE EXCEPTION 'El envío no existe.'; END IF;
  IF previous_status = 'delivered' THEN RAISE EXCEPTION 'El envío ya fue marcado como entregado.'; END IF;

  IF (SELECT count(*) FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer)) <> (SELECT count(*) FROM public.shipment_items WHERE shipment_id = p_shipment_id) THEN RAISE EXCEPTION 'Debe indicar la cantidad entregada de todos los artículos del envío.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer) LEFT JOIN public.shipment_items item ON item.id = d.item_id AND item.shipment_id = p_shipment_id WHERE item.id IS NULL) THEN RAISE EXCEPTION 'Uno o más artículos no pertenecen a este envío.'; END IF;

  SELECT profile.full_name, profile.delivery_pay INTO delivered_courier_name, courier_default_pay
    FROM public.couriers courier JOIN public.profiles profile ON profile.id = courier.profile_id JOIN public.companies company ON company.id = profile.company_id
   WHERE courier.id = p_delivered_by AND courier.active = true AND profile.active = true AND profile.can_deliver = true
     AND (coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false));
  IF delivered_courier_name IS NULL THEN RAISE EXCEPTION 'El usuario seleccionado no está habilitado para realizar entregas.'; END IF;

  SELECT coalesce(sum(item.deposit_amount), 0), coalesce(sum(item.shipping_fee), 0) INTO assigned_deposit, assigned_shipping_fee FROM public.shipment_items item WHERE item.shipment_id = p_shipment_id;
  IF assigned_deposit = 0 AND p_deposit_amount <> 0 THEN RAISE EXCEPTION 'Este envío no tiene depósito asignado.'; END IF;
  IF assigned_shipping_fee = 0 AND p_shipping_fee <> 0 THEN RAISE EXCEPTION 'Este envío no tiene costo de envío asignado.'; END IF;

  FOR delivery_item IN SELECT item.id, item.product_id, d.quantity FROM public.shipment_items item JOIN jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer) ON d.item_id = item.id WHERE item.shipment_id = p_shipment_id LOOP
    IF delivery_item.quantity > 0 THEN
      SELECT inventory.id, inventory.quantity INTO inventory_row FROM public.inventory inventory WHERE inventory.courier_id = p_delivered_by AND inventory.company_id = shipment_company_id AND inventory.product_id = delivery_item.product_id FOR UPDATE;
      IF inventory_row.id IS NULL THEN
        INSERT INTO public.inventory (courier_id, company_id, product_id, quantity, low_stock, medium_stock, updated_at) VALUES (p_delivered_by, shipment_company_id, delivery_item.product_id, -delivery_item.quantity, 5, 10, delivery_time) RETURNING id, quantity INTO inventory_row;
      ELSE
        UPDATE public.inventory SET quantity = inventory_row.quantity - delivery_item.quantity, updated_at = delivery_time WHERE id = inventory_row.id RETURNING quantity INTO inventory_row.quantity;
      END IF;
      INSERT INTO public.inventory_movements (inventory_id, quantity_before, quantity_change, quantity_after, reason, notes, created_by) VALUES (inventory_row.id, inventory_row.quantity + delivery_item.quantity, -delivery_item.quantity, inventory_row.quantity, 'Entrega de envío', format('Guía %s · Cantidad entregada: %s', shipment_tracking_number, delivery_item.quantity), auth.uid());
    END IF;
    UPDATE public.shipment_items SET delivered_quantity = delivery_item.quantity WHERE id = delivery_item.id;
  END LOOP;

  UPDATE public.shipments SET status = 'delivered', delivered_at = delivery_time, delivered_by_courier_id = p_delivered_by,
      receiver_type = p_receiver_type::public.receiver_type,
      deposit_collected = CASE WHEN assigned_deposit > 0 THEN p_deposit_amount ELSE 0 END,
      shipping_collected = CASE WHEN assigned_shipping_fee > 0 THEN p_shipping_fee ELSE 0 END,
      latitude = p_latitude, longitude = p_longitude, last_update_at = delivery_time,
      last_update_message = CASE WHEN p_latitude IS NULL THEN 'Entrega confirmada sin ubicación GPS' ELSE 'Entrega confirmada' END
    WHERE id = p_shipment_id;
  INSERT INTO public.shipment_status_history (shipment_id, previous_status, status, notes, created_by)
  VALUES (p_shipment_id, previous_status, 'delivered', nullif(concat_ws(' · ', nullif(trim(coalesce(p_observations, '')), ''), CASE WHEN p_latitude IS NULL THEN 'Ubicación de entrega no disponible' ELSE NULL END), ''), auth.uid());

  -- Precedencia: barrio > distrito > cantón > provincia > ruta > tarifa por defecto.
  SELECT rate.id, rate.delivery_charge,
      CASE WHEN rate.neighborhood_id IS NOT NULL THEN 'neighborhood' WHEN rate.district_id IS NOT NULL THEN 'district' WHEN rate.canton_id IS NOT NULL THEN 'canton' WHEN rate.province_id IS NOT NULL THEN 'province' ELSE 'route' END
    INTO company_rate_id, company_rate_amount, company_rate_scope
    FROM public.delivery_rates rate
   WHERE rate.company_id = shipment_company_id AND rate.route_id = shipment_route_id AND rate.active = true
     AND (rate.province_id IS NULL OR rate.province_id = resolved_province_id) AND (rate.canton_id IS NULL OR rate.canton_id = resolved_canton_id)
     AND (rate.district_id IS NULL OR rate.district_id = resolved_district_id) AND (rate.neighborhood_id IS NULL OR rate.neighborhood_id = shipment_neighborhood_id)
   ORDER BY (rate.neighborhood_id IS NOT NULL) DESC, (rate.district_id IS NOT NULL) DESC, (rate.canton_id IS NOT NULL) DESC, (rate.province_id IS NOT NULL) DESC, rate.created_at DESC, rate.id DESC LIMIT 1;

  SELECT rate.id, rate.delivery_pay,
      CASE WHEN rate.neighborhood_id IS NOT NULL THEN 'neighborhood' WHEN rate.district_id IS NOT NULL THEN 'district' WHEN rate.canton_id IS NOT NULL THEN 'canton' WHEN rate.province_id IS NOT NULL THEN 'province' ELSE 'route' END
    INTO courier_rate_id, courier_rate_amount, courier_rate_scope
    FROM public.courier_delivery_rates rate
   WHERE rate.courier_id = p_delivered_by AND rate.route_id = shipment_route_id AND rate.active = true
     AND (rate.province_id IS NULL OR rate.province_id = resolved_province_id) AND (rate.canton_id IS NULL OR rate.canton_id = resolved_canton_id)
     AND (rate.district_id IS NULL OR rate.district_id = resolved_district_id) AND (rate.neighborhood_id IS NULL OR rate.neighborhood_id = shipment_neighborhood_id)
   ORDER BY (rate.neighborhood_id IS NOT NULL) DESC, (rate.district_id IS NOT NULL) DESC, (rate.canton_id IS NOT NULL) DESC, (rate.province_id IS NOT NULL) DESC, rate.created_at DESC, rate.id DESC LIMIT 1;

  -- Sin excepción aplicable, se conserva la tarifa por defecto del DTS o mensajero.
  INSERT INTO public.shipment_delivery_financial_records (event_id, shipment_id, operation_type, record_type, status, company_id, courier_id, route_id, delivery_rate_id, tracking_number, customer_name, company_name, courier_name, route_name, rate_scope, original_amount, amount, occurred_at, created_by)
  VALUES (financial_event_id, p_shipment_id, 'delivery', 'company_delivery_charge', CASE WHEN company_rate_id IS NOT NULL OR company_default_charge IS NOT NULL THEN 'pending' ELSE 'unrated' END, shipment_company_id, p_delivered_by, shipment_route_id, company_rate_id, shipment_tracking_number, shipment_customer_name, shipment_company_name, delivered_courier_name, shipment_route_name, coalesce(company_rate_scope, 'default'), coalesce(company_rate_amount, company_default_charge, 0), coalesce(company_rate_amount, company_default_charge, 0), delivery_time, auth.uid());
  INSERT INTO public.shipment_delivery_financial_records (event_id, shipment_id, operation_type, record_type, status, company_id, courier_id, route_id, courier_delivery_rate_id, tracking_number, customer_name, company_name, courier_name, route_name, rate_scope, original_amount, amount, occurred_at, created_by)
  VALUES (financial_event_id, p_shipment_id, 'delivery', 'courier_delivery_payment', CASE WHEN courier_rate_id IS NOT NULL OR courier_default_pay IS NOT NULL THEN 'pending' ELSE 'unrated' END, shipment_company_id, p_delivered_by, shipment_route_id, courier_rate_id, shipment_tracking_number, shipment_customer_name, shipment_company_name, delivered_courier_name, shipment_route_name, coalesce(courier_rate_scope, 'default'), coalesce(courier_rate_amount, courier_default_pay, 0), coalesce(courier_rate_amount, courier_default_pay, 0), delivery_time, auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.complete_shipment_delivery(uuid, uuid, text, numeric, numeric, jsonb, text, double precision, double precision) FROM public;
GRANT EXECUTE ON FUNCTION public.complete_shipment_delivery(uuid, uuid, text, numeric, numeric, jsonb, text, double precision, double precision) TO authenticated;

-- Cada intento fallido es un evento independiente: un envío puede tener varios.
CREATE OR REPLACE FUNCTION public.register_shipment_failed_attempt(p_shipment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  previous_status public.shipment_status; shipment_company_id uuid; shipment_courier_id uuid; shipment_route_id uuid;
  tracking text; customer text; company_label text; courier_label text; route_label text;
  v_neighborhood_id bigint; v_district_id bigint; v_canton_id bigint; v_province_id bigint;
  company_default numeric; courier_default numeric; company_rate record; courier_rate record; event_id uuid := gen_random_uuid(); occurred timestamptz := now();
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debe iniciar sesión.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p JOIN public.companies c ON c.id=p.company_id WHERE p.id=auth.uid() AND p.active AND (coalesce(c.is_owner_company,false) OR coalesce(c.is_system_company,false))) THEN RAISE EXCEPTION 'Solo EPS puede registrar intentos fallidos.'; END IF;
  SELECT s.status,s.company_id,s.courier_id,s.route_id,s.tracking_number,s.customer_name,c.name,s.neighborhood_id,
         coalesce(n.district_id,s.district_id),d.canton_id,ca.province_id,c.delivery_charge,r.name
    INTO previous_status,shipment_company_id,shipment_courier_id,shipment_route_id,tracking,customer,company_label,v_neighborhood_id,v_district_id,v_canton_id,v_province_id,company_default,route_label
    FROM public.shipments s JOIN public.companies c ON c.id=s.company_id LEFT JOIN public.routes r ON r.id=s.route_id
    LEFT JOIN public.neighborhoods n ON n.id=s.neighborhood_id LEFT JOIN public.districts d ON d.id=coalesce(n.district_id,s.district_id)
    LEFT JOIN public.cantons ca ON ca.id=d.canton_id WHERE s.id=p_shipment_id FOR UPDATE OF s;
  IF NOT FOUND THEN RAISE EXCEPTION 'El envío no existe.'; END IF;
  IF shipment_courier_id IS NULL THEN RAISE EXCEPTION 'El envío no tiene mensajero asignado.'; END IF;
  SELECT p.full_name,p.failed_pay INTO courier_label,courier_default FROM public.couriers co JOIN public.profiles p ON p.id=co.profile_id WHERE co.id=shipment_courier_id AND co.active AND p.active;
  IF courier_label IS NULL THEN RAISE EXCEPTION 'El mensajero asignado no está habilitado.'; END IF;
  SELECT rate.id,rate.failed_charge,CASE WHEN rate.neighborhood_id IS NOT NULL THEN 'neighborhood' WHEN rate.district_id IS NOT NULL THEN 'district' WHEN rate.canton_id IS NOT NULL THEN 'canton' WHEN rate.province_id IS NOT NULL THEN 'province' ELSE 'route' END INTO company_rate FROM public.delivery_rates rate
   WHERE rate.company_id=shipment_company_id AND rate.route_id=shipment_route_id AND rate.active AND (rate.province_id IS NULL OR rate.province_id=v_province_id) AND (rate.canton_id IS NULL OR rate.canton_id=v_canton_id) AND (rate.district_id IS NULL OR rate.district_id=v_district_id) AND (rate.neighborhood_id IS NULL OR rate.neighborhood_id=v_neighborhood_id)
   ORDER BY (rate.neighborhood_id IS NOT NULL) DESC,(rate.district_id IS NOT NULL) DESC,(rate.canton_id IS NOT NULL) DESC,(rate.province_id IS NOT NULL) DESC,rate.created_at DESC LIMIT 1;
  SELECT rate.id,rate.failed_pay,CASE WHEN rate.neighborhood_id IS NOT NULL THEN 'neighborhood' WHEN rate.district_id IS NOT NULL THEN 'district' WHEN rate.canton_id IS NOT NULL THEN 'canton' WHEN rate.province_id IS NOT NULL THEN 'province' ELSE 'route' END INTO courier_rate FROM public.courier_delivery_rates rate
   WHERE rate.courier_id=shipment_courier_id AND rate.route_id=shipment_route_id AND rate.active AND (rate.province_id IS NULL OR rate.province_id=v_province_id) AND (rate.canton_id IS NULL OR rate.canton_id=v_canton_id) AND (rate.district_id IS NULL OR rate.district_id=v_district_id) AND (rate.neighborhood_id IS NULL OR rate.neighborhood_id=v_neighborhood_id)
   ORDER BY (rate.neighborhood_id IS NOT NULL) DESC,(rate.district_id IS NOT NULL) DESC,(rate.canton_id IS NOT NULL) DESC,(rate.province_id IS NOT NULL) DESC,rate.created_at DESC LIMIT 1;
  UPDATE public.shipments SET status='failed_attempt',last_update_at=occurred,last_update_message='Intento de entrega fallido registrado' WHERE id=p_shipment_id;
  INSERT INTO public.shipment_status_history(shipment_id,previous_status,status,notes,created_by) VALUES(p_shipment_id,previous_status,'failed_attempt','Intento fallido registrado para liquidación',auth.uid());
  INSERT INTO public.shipment_delivery_financial_records(event_id,shipment_id,operation_type,record_type,status,company_id,courier_id,route_id,delivery_rate_id,tracking_number,customer_name,company_name,courier_name,route_name,rate_scope,original_amount,amount,occurred_at,created_by)
  VALUES(event_id,p_shipment_id,'failed_attempt','company_delivery_charge',CASE WHEN company_rate.id IS NULL AND company_default IS NULL THEN 'unrated' ELSE 'pending' END,shipment_company_id,shipment_courier_id,shipment_route_id,company_rate.id,tracking,customer,company_label,courier_label,route_label,coalesce(company_rate.rate_scope,'default'),coalesce(company_rate.failed_charge,company_default,0),coalesce(company_rate.failed_charge,company_default,0),occurred,auth.uid());
  INSERT INTO public.shipment_delivery_financial_records(event_id,shipment_id,operation_type,record_type,status,company_id,courier_id,route_id,courier_delivery_rate_id,tracking_number,customer_name,company_name,courier_name,route_name,rate_scope,original_amount,amount,occurred_at,created_by)
  VALUES(event_id,p_shipment_id,'failed_attempt','courier_delivery_payment',CASE WHEN courier_rate.id IS NULL AND courier_default IS NULL THEN 'unrated' ELSE 'pending' END,shipment_company_id,shipment_courier_id,shipment_route_id,courier_rate.id,tracking,customer,company_label,courier_label,route_label,coalesce(courier_rate.rate_scope,'default'),coalesce(courier_rate.failed_pay,courier_default,0),coalesce(courier_rate.failed_pay,courier_default,0),occurred,auth.uid());
END; $$;
REVOKE ALL ON FUNCTION public.register_shipment_failed_attempt(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.register_shipment_failed_attempt(uuid) TO authenticated;

-- Consulta paginada de reportes. Solamente administradores/supervisores de EPS pueden ejecutarla.
DROP FUNCTION IF EXISTS public.get_delivery_financial_records_page(
  text, text, text, text, text, text, timestamptz, timestamptz, integer, integer
);
CREATE OR REPLACE FUNCTION public.get_delivery_financial_records_page(
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
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
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
  SELECT record.id, record.shipment_id, record.occurred_at, record.tracking_number, record.customer_name, record.company_name,
         record.courier_name, record.route_name, record.rate_scope, record.amount,
         record.status, count(*) OVER (), coalesce(sum(record.amount) OVER (), 0)
    FROM filtered record
   ORDER BY record.occurred_at DESC, record.created_at DESC
   LIMIT greatest(p_limit, 1)
  OFFSET greatest(p_offset, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.get_delivery_financial_records_page(text, text, text, text, text, text, timestamptz, timestamptz, integer, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.get_delivery_financial_records_page(text, text, text, text, text, text, timestamptz, timestamptz, integer, integer) TO authenticated;

-- El pago de mensajero puede corregirse sin alterar la evidencia de la tarifa original.
CREATE OR REPLACE FUNCTION public.update_courier_delivery_payment_amount(
  p_financial_record_id uuid,
  p_new_amount numeric,
  p_justification text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_amount numeric;
BEGIN
  IF p_new_amount IS NULL OR p_new_amount < 0 THEN
    RAISE EXCEPTION 'El nuevo monto debe ser igual o mayor que cero.';
  END IF;
  IF length(trim(coalesce(p_justification, ''))) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'Debe indicar una justificación de hasta 500 caracteres.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid() AND profile.active = true
      AND profile.role IN ('super_admin', 'company_admin')
      AND (coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para modificar pagos de mensajeros.';
  END IF;

  SELECT amount INTO current_amount
    FROM public.shipment_delivery_financial_records
   WHERE id = p_financial_record_id
     AND record_type = 'courier_delivery_payment'
     AND status <> 'voided'
   FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El pago no existe o está anulado.'; END IF;
  IF current_amount = p_new_amount THEN RAISE EXCEPTION 'El monto nuevo es igual al monto actual.'; END IF;

  UPDATE public.shipment_delivery_financial_records
     SET amount = p_new_amount
   WHERE id = p_financial_record_id;
  INSERT INTO public.shipment_delivery_financial_amount_changes (
    financial_record_id, previous_amount, new_amount, justification, changed_by
  ) VALUES (p_financial_record_id, current_amount, p_new_amount, trim(p_justification), auth.uid());
END;
$$;
REVOKE ALL ON FUNCTION public.update_courier_delivery_payment_amount(uuid, numeric, text) FROM public;
GRANT EXECUTE ON FUNCTION public.update_courier_delivery_payment_amount(uuid, numeric, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_courier_delivery_payment_amount_changes(p_financial_record_id uuid)
RETURNS TABLE(previous_amount numeric, new_amount numeric, justification text, changed_at timestamptz, changed_by_name text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid() AND profile.active = true
      AND profile.role IN ('super_admin', 'company_admin')
      AND (coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para consultar el historial de pagos.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.shipment_delivery_financial_records
    WHERE id = p_financial_record_id AND record_type = 'courier_delivery_payment'
  ) THEN
    RAISE EXCEPTION 'El pago no existe.';
  END IF;
  RETURN QUERY
  SELECT change.previous_amount, change.new_amount, change.justification, change.changed_at,
         coalesce(profile.full_name, 'Usuario eliminado')
    FROM public.shipment_delivery_financial_amount_changes change
    LEFT JOIN public.profiles profile ON profile.id = change.changed_by
   WHERE change.financial_record_id = p_financial_record_id
   ORDER BY change.changed_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.get_courier_delivery_payment_amount_changes(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_courier_delivery_payment_amount_changes(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';
