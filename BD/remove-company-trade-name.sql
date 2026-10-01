BEGIN;

-- El historial de tracking dependía de trade_name. Se redefine antes de
-- eliminar la columna para conservar la auditoría sin dependencias rotas.
CREATE OR REPLACE FUNCTION public.log_tracking_record_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_province_name text;
  new_province_name text;
  old_company_name text;
  new_company_name text;
BEGIN
  IF old.full_name IS DISTINCT FROM new.full_name THEN
    INSERT INTO public.tracking_record_history (tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value)
    VALUES (new.id, auth.uid(), 'Nombre', old.full_name, new.full_name);
  END IF;

  IF old.identification IS DISTINCT FROM new.identification THEN
    INSERT INTO public.tracking_record_history (tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value)
    VALUES (new.id, auth.uid(), 'Cédula', old.identification, new.identification);
  END IF;

  IF old.province_id IS DISTINCT FROM new.province_id THEN
    SELECT name INTO old_province_name FROM public.provinces WHERE id = old.province_id;
    SELECT name INTO new_province_name FROM public.provinces WHERE id = new.province_id;
    INSERT INTO public.tracking_record_history (tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value)
    VALUES (new.id, auth.uid(), 'Provincia', old_province_name, new_province_name);
  END IF;

  IF old.status IS DISTINCT FROM new.status THEN
    INSERT INTO public.tracking_record_history (tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value)
    VALUES (new.id, auth.uid(), 'Estatus', old.status, new.status);
  END IF;

  IF old.comment IS DISTINCT FROM new.comment THEN
    INSERT INTO public.tracking_record_history (tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value)
    VALUES (new.id, auth.uid(), 'Comentario', old.comment, new.comment);
  END IF;

  IF old.company_id IS DISTINCT FROM new.company_id THEN
    SELECT name INTO old_company_name FROM public.companies WHERE id = old.company_id;
    SELECT name INTO new_company_name FROM public.companies WHERE id = new.company_id;
    INSERT INTO public.tracking_record_history (tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value)
    VALUES (new.id, auth.uid(), 'Empresa', old_company_name, new_company_name);
  END IF;

  RETURN new;
END;
$$;

ALTER TABLE public.companies DROP COLUMN IF EXISTS trade_name;

NOTIFY pgrst, 'reload schema';
COMMIT;
