BEGIN;

ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS restricted_supervisor_mode boolean NOT NULL DEFAULT true;

INSERT INTO public.system_settings (id, dts_chat_enabled, restricted_supervisor_mode)
VALUES (true, false, true)
ON CONFLICT (id) DO UPDATE
SET restricted_supervisor_mode = true;

COMMENT ON COLUMN public.system_settings.restricted_supervisor_mode IS
  'Cuando es true, el sidebar de supervisores EPS muestra solo Inicio, Mi seguridad, Tracking y Cobertura.';

NOTIFY pgrst, 'reload schema';
COMMIT;
