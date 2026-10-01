BEGIN;

-- Un mensajero no puede leer la fila privada de una empresa directamente.
-- Los demás usuarios EPS conservan el acceso actual a código y nombre.
DROP POLICY IF EXISTS companies_select_company_privacy ON public.companies;
CREATE POLICY companies_select_company_privacy
ON public.companies
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IS DISTINCT FROM 'courier'::public.user_role
  AND (
    public.is_owner_company_user()
    OR id = public.current_profile_company_id()
  )
);

CREATE OR REPLACE FUNCTION public.get_current_company_context()
RETURNS TABLE(company_id uuid, code text, is_owner_company boolean, is_system_company boolean, is_courier boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company.id, company.code, coalesce(company.is_owner_company, false),
         coalesce(company.is_system_company, false), profile.role = 'courier'
  FROM public.profiles profile
  JOIN public.companies company ON company.id = profile.company_id
  WHERE profile.id = auth.uid() AND profile.active = true;
$$;

CREATE OR REPLACE FUNCTION public.get_visible_company_directory(p_company_ids uuid[] DEFAULT NULL)
RETURNS TABLE(id uuid, code text, name text, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH viewer AS (
    SELECT profile.id, profile.role, profile.company_id,
           coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false) AS is_eps
    FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid() AND profile.active = true
  ), visible AS (
    SELECT company.*
    FROM public.companies company
    CROSS JOIN viewer
    WHERE (p_company_ids IS NULL OR company.id = ANY(p_company_ids))
      AND (
        viewer.role <> 'courier'
        OR company.id = viewer.company_id
        OR EXISTS (
          SELECT 1
          FROM public.shipments shipment
          JOIN public.couriers courier ON courier.id = shipment.courier_id
          WHERE courier.profile_id = viewer.id
            AND shipment.company_id = company.id
        )
      )
  )
  SELECT company.id, company.code,
         CASE WHEN (SELECT role FROM viewer) = 'courier' THEN NULL ELSE company.name END,
         CASE WHEN (SELECT role FROM viewer) = 'courier' THEN company.code
              ELSE concat_ws(' - ', nullif(company.code, ''), nullif(company.name, '')) END
  FROM visible company;
$$;

REVOKE ALL ON FUNCTION public.get_current_company_context() FROM public;
REVOKE ALL ON FUNCTION public.get_visible_company_directory(uuid[]) FROM public;
GRANT EXECUTE ON FUNCTION public.get_current_company_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_visible_company_directory(uuid[]) TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
