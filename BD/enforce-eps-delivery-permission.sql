BEGIN;

-- Corrige perfiles DTS que recibieron por error permiso operativo de entrega.
UPDATE public.profiles profile
SET can_deliver = false
FROM public.companies company
WHERE company.id = profile.company_id
  AND profile.can_deliver = true
  AND NOT (
    coalesce(company.is_owner_company, false)
    OR coalesce(company.is_system_company, false)
  );

-- Conserva el historial del mensajero, pero lo deja fuera de las asignaciones activas.
UPDATE public.couriers courier
SET active = false
FROM public.profiles profile
JOIN public.companies company ON company.id = profile.company_id
WHERE courier.profile_id = profile.id
  AND courier.active = true
  AND NOT (
    coalesce(company.is_owner_company, false)
    OR coalesce(company.is_system_company, false)
  );

CREATE OR REPLACE FUNCTION public.enforce_eps_delivery_permission()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  company_is_owner boolean;
BEGIN
  IF NEW.can_deliver IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(company.is_owner_company, false)
      OR coalesce(company.is_system_company, false)
    INTO company_is_owner
  FROM public.companies company
  WHERE company.id = NEW.company_id;

  IF coalesce(company_is_owner, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Los usuarios de empresas DTS no pueden realizar entregas.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_eps_delivery_permission ON public.profiles;
CREATE TRIGGER enforce_eps_delivery_permission
BEFORE INSERT OR UPDATE OF company_id, can_deliver
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_eps_delivery_permission();

-- Si una empresa deja de ser la propietaria/del sistema, desactiva automáticamente
-- cualquier permiso operativo de entrega que hubiera quedado asociado a sus usuarios.
CREATE OR REPLACE FUNCTION public.clear_delivery_permission_for_client_company()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT (
    coalesce(NEW.is_owner_company, false)
    OR coalesce(NEW.is_system_company, false)
  ) THEN
    UPDATE public.profiles
    SET can_deliver = false
    WHERE company_id = NEW.id
      AND can_deliver = true;

    UPDATE public.couriers courier
    SET active = false
    FROM public.profiles profile
    WHERE courier.profile_id = profile.id
      AND profile.company_id = NEW.id
      AND courier.active = true;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS clear_delivery_permission_for_client_company ON public.companies;
CREATE TRIGGER clear_delivery_permission_for_client_company
AFTER UPDATE OF is_owner_company, is_system_company
ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.clear_delivery_permission_for_client_company();

COMMIT;
