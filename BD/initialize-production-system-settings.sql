BEGIN;

-- Estado inicial seguro para producción: el chat queda disponible para AGILIZA
-- y deshabilitado para empresas DTS hasta que un administrador EPS lo active.
INSERT INTO public.system_settings (id, dts_chat_enabled, updated_at, updated_by)
VALUES (true, false, now(), NULL)
ON CONFLICT (id) DO UPDATE
SET dts_chat_enabled = false,
    updated_at = now(),
    updated_by = NULL;

COMMIT;
