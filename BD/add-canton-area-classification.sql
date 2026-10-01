BEGIN;

ALTER TABLE public.cantons
  ADD COLUMN IF NOT EXISTS area_classification text NULL;

ALTER TABLE public.cantons
  DROP CONSTRAINT IF EXISTS cantons_area_classification_check;

ALTER TABLE public.cantons
  ADD CONSTRAINT cantons_area_classification_check
  CHECK (area_classification IS NULL OR area_classification IN ('gam', 'rural'));

CREATE INDEX IF NOT EXISTS cantons_province_area_classification_idx
  ON public.cantons(province_id, area_classification);

CREATE OR REPLACE FUNCTION public.set_canton_area_classification(
  p_canton_id bigint,
  p_area_classification text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid()
      AND profile.active = true
      AND (company.is_owner_company = true OR company.is_system_company = true)
      AND profile.role IN ('super_admin'::public.user_role, 'company_admin'::public.user_role)
  ) INTO v_allowed;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'No tiene permiso para clasificar cantones.' USING ERRCODE = '42501';
  END IF;

  IF p_area_classification IS NOT NULL AND p_area_classification NOT IN ('gam', 'rural') THEN
    RAISE EXCEPTION 'Clasificación de cantón inválida.';
  END IF;

  UPDATE public.cantons
  SET area_classification = p_area_classification
  WHERE id = p_canton_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El cantón indicado no existe.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_canton_area_classification(bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_canton_area_classification(bigint, text) TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
