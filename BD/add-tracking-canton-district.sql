BEGIN;

ALTER TABLE public.tracking_records
  ADD COLUMN IF NOT EXISTS canton_id bigint NULL REFERENCES public.cantons(id),
  ADD COLUMN IF NOT EXISTS district_id bigint NULL REFERENCES public.districts(id);

CREATE INDEX IF NOT EXISTS tracking_records_canton_created_at_idx
  ON public.tracking_records(canton_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tracking_records_district_created_at_idx
  ON public.tracking_records(district_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.validate_tracking_record_location()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.canton_id IS NULL) <> (NEW.district_id IS NULL) THEN
    RAISE EXCEPTION 'Debe seleccionar tanto el cantón como el distrito.';
  END IF;

  IF NEW.canton_id IS NULL AND NEW.district_id IS NULL THEN
    IF TG_OP = 'INSERT' THEN
      RAISE EXCEPTION 'Debe seleccionar provincia, cantón y distrito.';
    END IF;
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.cantons canton
    WHERE canton.id = NEW.canton_id
      AND canton.province_id = NEW.province_id
  ) THEN
    RAISE EXCEPTION 'El cantón no pertenece a la provincia seleccionada.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.districts district
    WHERE district.id = NEW.district_id
      AND district.canton_id = NEW.canton_id
  ) THEN
    RAISE EXCEPTION 'El distrito no pertenece al cantón seleccionado.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_tracking_record_location ON public.tracking_records;
CREATE TRIGGER validate_tracking_record_location
BEFORE INSERT OR UPDATE OF province_id, canton_id, district_id
ON public.tracking_records
FOR EACH ROW EXECUTE FUNCTION public.validate_tracking_record_location();

CREATE OR REPLACE FUNCTION public.log_tracking_record_location_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_canton_name text;
  new_canton_name text;
  old_district_name text;
  new_district_name text;
BEGIN
  IF OLD.canton_id IS DISTINCT FROM NEW.canton_id THEN
    SELECT name INTO old_canton_name FROM public.cantons WHERE id = OLD.canton_id;
    SELECT name INTO new_canton_name FROM public.cantons WHERE id = NEW.canton_id;
    INSERT INTO public.tracking_record_history (tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value)
    VALUES (NEW.id, auth.uid(), 'Cantón', old_canton_name, new_canton_name);
  END IF;

  IF OLD.district_id IS DISTINCT FROM NEW.district_id THEN
    SELECT name INTO old_district_name FROM public.districts WHERE id = OLD.district_id;
    SELECT name INTO new_district_name FROM public.districts WHERE id = NEW.district_id;
    INSERT INTO public.tracking_record_history (tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value)
    VALUES (NEW.id, auth.uid(), 'Distrito', old_district_name, new_district_name);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_tracking_record_location_changes ON public.tracking_records;
CREATE TRIGGER log_tracking_record_location_changes
AFTER UPDATE ON public.tracking_records
FOR EACH ROW EXECUTE FUNCTION public.log_tracking_record_location_changes();

COMMIT;
