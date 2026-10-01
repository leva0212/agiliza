BEGIN;

CREATE TABLE IF NOT EXISTS public.system_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  dts_chat_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL
);

INSERT INTO public.system_settings (id, dts_chat_enabled)
VALUES (true, false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS system_settings_authenticated_read ON public.system_settings;
CREATE POLICY system_settings_authenticated_read
  ON public.system_settings
  FOR SELECT
  TO authenticated
  USING (true);

REVOKE INSERT, UPDATE, DELETE ON public.system_settings FROM anon, authenticated;
GRANT SELECT ON public.system_settings TO authenticated;

CREATE OR REPLACE FUNCTION public.chat_is_enabled_for_current_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.companies c ON c.id = p.company_id
    WHERE p.id = auth.uid()
      AND p.active
      AND (
        coalesce(c.is_owner_company, false)
        OR coalesce(c.is_system_company, false)
        OR coalesce((SELECT s.dts_chat_enabled FROM public.system_settings s WHERE s.id = true), false)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_chat(p_conversation_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.chat_is_enabled_for_current_user() AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE c.id = p_conversation_id AND p.active
      AND (p.company_id = c.client_company_id OR p.company_id = c.owner_company_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.can_write_chat(p_conversation_id uuid, p_template_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.chat_is_enabled_for_current_user() AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE c.id = p_conversation_id AND p.active
      AND (p.company_id = c.client_company_id OR (p.company_id = c.owner_company_id AND (p.role <> 'courier' OR p.can_chat_directly_with_clients OR p_template_key IS NOT NULL)))
  );
$$;

GRANT EXECUTE ON FUNCTION public.chat_is_enabled_for_current_user() TO authenticated;

COMMENT ON TABLE public.system_settings IS 'Configuración global y única de SysLogistics.';
COMMENT ON COLUMN public.system_settings.dts_chat_enabled IS 'Permite a usuarios de empresas DTS acceder al chat.';

NOTIFY pgrst, 'reload schema';

COMMIT;
