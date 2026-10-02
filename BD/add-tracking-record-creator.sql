BEGIN;

ALTER TABLE public.tracking_records
  ADD COLUMN IF NOT EXISTS created_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tracking_records_created_by_idx
  ON public.tracking_records(created_by);

-- Registra siempre el usuario autenticado que creó el tracking y evita que se altere después.
CREATE OR REPLACE FUNCTION public.enforce_tracking_record_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Debe iniciar sesión para crear un tracking.';
    END IF;

    NEW.created_by := auth.uid();

    IF NOT public.is_owner_company_user() THEN
      IF NEW.company_id IS DISTINCT FROM public.current_profile_company_id()
        OR NEW.status IS DISTINCT FROM 'EN RUTA'
        OR NEW.comment IS NOT NULL THEN
        RAISE EXCEPTION 'No tiene permiso para definir empresa, estatus o comentario.';
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'La fecha de creación no se puede modificar.';
  END IF;

  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'El creador del tracking no se puede modificar.';
  END IF;

  IF NOT public.is_owner_company_user() THEN
    IF NEW.company_id IS DISTINCT FROM OLD.company_id
      OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.comment IS DISTINCT FROM OLD.comment THEN
      RAISE EXCEPTION 'Solo puede modificar nombre, cédula y ubicación.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Entrega una etiqueta segura para la tabla sin exponer nombres del personal EPS a una DTS.
DROP FUNCTION IF EXISTS public.get_tracking_record_creator_labels(uuid[]);

CREATE FUNCTION public.get_tracking_record_creator_labels(p_record_ids uuid[])
RETURNS TABLE(record_id uuid, created_by_label text, created_by_company_label text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viewer_id uuid := auth.uid();
  v_viewer_company_id uuid;
  v_viewer_role public.user_role;
  v_is_eps boolean := false;
BEGIN
  SELECT profile.company_id, profile.role,
         coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false)
    INTO v_viewer_company_id, v_viewer_role, v_is_eps
    FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
   WHERE profile.id = v_viewer_id
     AND profile.active = true;

  IF v_viewer_company_id IS NULL THEN
    RAISE EXCEPTION 'No autorizado.';
  END IF;

  RETURN QUERY
  SELECT record.id,
    CASE
      WHEN record.created_by IS NULL THEN 'Sin información'
      WHEN v_is_eps THEN coalesce(creator.full_name, 'Usuario eliminado')
      WHEN record.created_by = v_viewer_id THEN 'Tú'
      WHEN creator.company_id = v_viewer_company_id THEN concat_ws(' · ', creator.full_name,
        CASE creator.role
          WHEN 'company_admin' THEN 'Operativo'
          WHEN 'seller' THEN 'Vendedor'
          WHEN 'courier' THEN 'Mensajero'
          ELSE 'Usuario DTS'
        END)
      ELSE CASE creator.role
        WHEN 'super_admin' THEN 'Administrativo'
        WHEN 'company_admin' THEN 'Operativo'
        WHEN 'courier' THEN 'Mensajero'
        ELSE 'Personal de Agiliza'
      END
    END AS created_by_label,
    CASE
      WHEN record.created_by IS NULL THEN 'Sin información'
      WHEN v_is_eps AND v_viewer_role <> 'courier'
        THEN concat_ws(' - ', creator_company.code, creator_company.name)
      WHEN coalesce(creator_company.is_owner_company, false)
        THEN coalesce(creator_company.name, creator_company.code, 'Empresa propietaria')
      WHEN creator.company_id = v_viewer_company_id
        THEN coalesce(creator_company.name, creator_company.code, 'Tu empresa')
      ELSE NULL
    END AS created_by_company_label
  FROM public.tracking_records record
  LEFT JOIN public.profiles creator ON creator.id = record.created_by
  LEFT JOIN public.companies creator_company ON creator_company.id = creator.company_id
  WHERE record.id = ANY(coalesce(p_record_ids, ARRAY[]::uuid[]))
    AND (v_is_eps OR record.company_id = v_viewer_company_id);
END;
$$;

REVOKE ALL ON FUNCTION public.get_tracking_record_creator_labels(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_tracking_record_creator_labels(uuid[]) TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
