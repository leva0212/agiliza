-- Monitor y listado de inventario. Ambas funciones respetan RLS.
DROP FUNCTION IF EXISTS public.get_inventory_summary(uuid, uuid, uuid, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_inventory_summary(uuid, uuid, uuid, text, integer, integer, text);
DROP FUNCTION IF EXISTS public.get_inventory_page(uuid, uuid, uuid, text, integer, integer, text, integer, integer);

CREATE OR REPLACE FUNCTION public.get_inventory_summary(p_courier_id uuid DEFAULT NULL, p_company_id uuid DEFAULT NULL, p_product_id uuid DEFAULT NULL, p_quantity_operator text DEFAULT NULL, p_quantity_value integer DEFAULT NULL, p_quantity_value2 integer DEFAULT NULL, p_stock_status text DEFAULT NULL)
RETURNS TABLE(total_quantity bigint, total_records bigint, low_records bigint, medium_records bigint, high_records bigint, low_couriers bigint, low_companies bigint, low_products bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  WITH classified AS (
    SELECT inventory.*, CASE WHEN quantity < low_stock THEN 'low' WHEN quantity < medium_stock THEN 'medium' ELSE 'high' END AS stock_status
    FROM public.inventory inventory
    WHERE (p_courier_id IS NULL OR courier_id = p_courier_id)
      AND (p_company_id IS NULL OR company_id = p_company_id)
      AND (p_product_id IS NULL OR product_id = p_product_id)
      AND (p_quantity_operator IS NULL OR p_quantity_operator = '' OR (p_quantity_operator = '=' AND quantity = p_quantity_value) OR (p_quantity_operator = '<' AND quantity < p_quantity_value) OR (p_quantity_operator = '<=' AND quantity <= p_quantity_value) OR (p_quantity_operator = '>' AND quantity > p_quantity_value) OR (p_quantity_operator = '>=' AND quantity >= p_quantity_value) OR (p_quantity_operator = 'between' AND quantity BETWEEN p_quantity_value AND p_quantity_value2))
  )
  SELECT coalesce(sum(quantity) FILTER (WHERE p_stock_status IS NULL OR stock_status = p_stock_status), 0)::bigint,
    count(*) FILTER (WHERE p_stock_status IS NULL OR stock_status = p_stock_status)::bigint,
    count(*) FILTER (WHERE stock_status = 'low')::bigint, count(*) FILTER (WHERE stock_status = 'medium')::bigint, count(*) FILTER (WHERE stock_status = 'high')::bigint,
    count(DISTINCT courier_id) FILTER (WHERE stock_status = 'low')::bigint, count(DISTINCT company_id) FILTER (WHERE stock_status = 'low')::bigint, count(DISTINCT product_id) FILTER (WHERE stock_status = 'low')::bigint
  FROM classified;
$$;

CREATE OR REPLACE FUNCTION public.get_inventory_page(p_courier_id uuid DEFAULT NULL, p_company_id uuid DEFAULT NULL, p_product_id uuid DEFAULT NULL, p_quantity_operator text DEFAULT NULL, p_quantity_value integer DEFAULT NULL, p_quantity_value2 integer DEFAULT NULL, p_stock_status text DEFAULT NULL, p_limit integer DEFAULT 10, p_offset integer DEFAULT 0)
RETURNS TABLE(id uuid, courier_id uuid, company_id uuid, product_id uuid, quantity integer, low_stock integer, medium_stock integer, updated_at timestamptz, courier_name text, company_name text, product_name text, stock_status text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  WITH classified AS (
    SELECT inventory.*, CASE WHEN quantity < low_stock THEN 'low' WHEN quantity < medium_stock THEN 'medium' ELSE 'high' END AS stock_status
    FROM public.inventory inventory
    WHERE (p_courier_id IS NULL OR courier_id = p_courier_id)
      AND (p_company_id IS NULL OR company_id = p_company_id)
      AND (p_product_id IS NULL OR product_id = p_product_id)
      AND (p_quantity_operator IS NULL OR p_quantity_operator = '' OR (p_quantity_operator = '=' AND quantity = p_quantity_value) OR (p_quantity_operator = '<' AND quantity < p_quantity_value) OR (p_quantity_operator = '<=' AND quantity <= p_quantity_value) OR (p_quantity_operator = '>' AND quantity > p_quantity_value) OR (p_quantity_operator = '>=' AND quantity >= p_quantity_value) OR (p_quantity_operator = 'between' AND quantity BETWEEN p_quantity_value AND p_quantity_value2))
  )
  SELECT i.id, i.courier_id, i.company_id, i.product_id, i.quantity, i.low_stock, i.medium_stock, i.updated_at, profile.full_name, company.name, product.name, i.stock_status
  FROM classified i
  LEFT JOIN public.companies company ON company.id = i.company_id
  LEFT JOIN public.products product ON product.id = i.product_id
  LEFT JOIN public.couriers courier ON courier.id = i.courier_id
  LEFT JOIN public.profiles profile ON profile.id = courier.profile_id
  WHERE p_stock_status IS NULL OR i.stock_status = p_stock_status
  ORDER BY i.updated_at DESC
  LIMIT greatest(p_limit, 1) OFFSET greatest(p_offset, 0);
$$;

REVOKE ALL ON FUNCTION public.get_inventory_summary(uuid, uuid, uuid, text, integer, integer, text) FROM public;
REVOKE ALL ON FUNCTION public.get_inventory_page(uuid, uuid, uuid, text, integer, integer, text, integer, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.get_inventory_summary(uuid, uuid, uuid, text, integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_inventory_page(uuid, uuid, uuid, text, integer, integer, text, integer, integer) TO authenticated;
NOTIFY pgrst, 'reload schema';
