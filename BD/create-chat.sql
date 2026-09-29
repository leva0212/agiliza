-- Chat EPS ↔ DTS. Ejecutar antes de publicar la interfaz.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_chat_directly_with_clients boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_company_id uuid NOT NULL REFERENCES public.companies(id),
  client_company_id uuid NOT NULL REFERENCES public.companies(id),
  shipment_id uuid NULL REFERENCES public.shipments(id) ON DELETE SET NULL,
  subject text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (owner_company_id <> client_company_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS chat_conversations_unique_shipment ON public.chat_conversations(owner_company_id, client_company_id, shipment_id) WHERE shipment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  body text NULL,
  template_key text NULL,
  latitude double precision NULL,
  longitude double precision NULL,
  location_accuracy_meters numeric NULL,
  attachment_url text NULL,
  attachment_type text NULL,
  edited_at timestamptz NULL,
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (body IS NOT NULL OR template_key IS NOT NULL OR latitude IS NOT NULL OR attachment_url IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS public.chat_message_reads (
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, profile_id)
);

CREATE OR REPLACE FUNCTION public.can_access_chat(p_conversation_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_conversations c JOIN public.profiles p ON p.id = auth.uid() WHERE c.id=p_conversation_id AND p.active AND (p.company_id=c.client_company_id OR p.company_id=c.owner_company_id));
$$;
CREATE OR REPLACE FUNCTION public.can_write_chat(p_conversation_id uuid, p_template_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_conversations c JOIN public.profiles p ON p.id=auth.uid() WHERE c.id=p_conversation_id AND p.active AND (p.company_id=c.client_company_id OR (p.company_id=c.owner_company_id AND (p.role <> 'courier' OR p.can_chat_directly_with_clients OR p_template_key IS NOT NULL))));
$$;

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_message_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS chat_conversations_access ON public.chat_conversations;
CREATE POLICY chat_conversations_access ON public.chat_conversations FOR ALL USING (public.can_access_chat(id)) WITH CHECK (public.can_access_chat(id));
DROP POLICY IF EXISTS chat_messages_read ON public.chat_messages;
CREATE POLICY chat_messages_read ON public.chat_messages FOR SELECT USING (public.can_access_chat(conversation_id));
DROP POLICY IF EXISTS chat_messages_insert ON public.chat_messages;
CREATE POLICY chat_messages_insert ON public.chat_messages FOR INSERT WITH CHECK (author_id=auth.uid() AND public.can_write_chat(conversation_id,template_key));
DROP POLICY IF EXISTS chat_messages_update ON public.chat_messages;
CREATE POLICY chat_messages_update ON public.chat_messages FOR UPDATE USING (author_id=auth.uid() AND deleted_at IS NULL) WITH CHECK (author_id=auth.uid());
DROP POLICY IF EXISTS chat_reads_access ON public.chat_message_reads;
CREATE POLICY chat_reads_access ON public.chat_message_reads FOR ALL USING (profile_id=auth.uid() AND EXISTS (SELECT 1 FROM public.chat_messages m WHERE m.id=message_id AND public.can_access_chat(m.conversation_id))) WITH CHECK (profile_id=auth.uid());
NOTIFY pgrst, 'reload schema';

CREATE OR REPLACE FUNCTION public.get_or_create_shipment_chat(p_shipment_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_client_company uuid; v_owner_company uuid; v_conversation uuid;
BEGIN
  SELECT company_id INTO v_client_company FROM public.shipments WHERE id=p_shipment_id;
  IF v_client_company IS NULL THEN RAISE EXCEPTION 'El envío no existe.'; END IF;
  SELECT c.id INTO v_owner_company FROM public.companies c WHERE coalesce(c.is_owner_company,false) OR coalesce(c.is_system_company,false) ORDER BY c.created_at NULLS LAST LIMIT 1;
  IF v_owner_company IS NULL THEN RAISE EXCEPTION 'No existe una empresa propietaria configurada.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.active AND p.company_id IN (v_client_company,v_owner_company)) THEN RAISE EXCEPTION 'No tiene acceso a este chat.'; END IF;
  SELECT id INTO v_conversation FROM public.chat_conversations WHERE owner_company_id=v_owner_company AND client_company_id=v_client_company AND shipment_id=p_shipment_id;
  IF v_conversation IS NULL THEN INSERT INTO public.chat_conversations(owner_company_id,client_company_id,shipment_id,subject) VALUES(v_owner_company,v_client_company,p_shipment_id,'Consulta del envío') RETURNING id INTO v_conversation; END IF;
  RETURN v_conversation;
END; $$;
GRANT EXECUTE ON FUNCTION public.get_or_create_shipment_chat(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';

CREATE OR REPLACE FUNCTION public.get_unread_chat_notifications()
RETURNS TABLE(conversation_id uuid, subject text, tracking_number text, company_name text, unread_count bigint, last_message text, last_message_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH pending AS (
    SELECT m.* FROM public.chat_messages m
    WHERE m.author_id <> auth.uid() AND m.deleted_at IS NULL AND public.can_access_chat(m.conversation_id)
      AND NOT EXISTS (SELECT 1 FROM public.chat_message_reads r WHERE r.message_id=m.id AND r.profile_id=auth.uid())
  )
  SELECT c.id, c.subject, s.tracking_number, company.name, count(p.id)::bigint,
    (array_agg(coalesce(p.body,'Ubicación o adjunto') ORDER BY p.created_at DESC))[1], max(p.created_at)
  FROM pending p JOIN public.chat_conversations c ON c.id=p.conversation_id
  LEFT JOIN public.shipments s ON s.id=c.shipment_id
  LEFT JOIN public.companies company ON company.id=c.client_company_id
  GROUP BY c.id,c.subject,s.tracking_number,company.name ORDER BY max(p.created_at) DESC;
$$;
CREATE OR REPLACE FUNCTION public.mark_chat_conversation_read(p_conversation_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.chat_message_reads(message_id,profile_id)
  SELECT m.id,auth.uid() FROM public.chat_messages m WHERE m.conversation_id=p_conversation_id AND m.author_id<>auth.uid() AND m.deleted_at IS NULL AND public.can_access_chat(p_conversation_id)
  ON CONFLICT DO NOTHING;
$$;
GRANT EXECUTE ON FUNCTION public.get_unread_chat_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_chat_conversation_read(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';

-- Mensajes del chat con identidad segura según quién consulta.
-- DTS nunca recibe nombres personales de usuarios EPS; EPS sí recibe nombres DTS.
CREATE OR REPLACE FUNCTION public.get_chat_messages(p_conversation_id uuid)
RETURNS TABLE(
  id uuid,
  body text,
  created_at timestamptz,
  edited_at timestamptz,
  is_mine boolean,
  sender_label text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viewer_company_id uuid;
  v_owner_company_id uuid;
BEGIN
  IF NOT public.can_access_chat(p_conversation_id) THEN
    RAISE EXCEPTION 'No tiene acceso a esta conversación.';
  END IF;

  SELECT p.company_id, c.owner_company_id
    INTO v_viewer_company_id, v_owner_company_id
  FROM public.profiles p
  JOIN public.chat_conversations c ON c.id = p_conversation_id
  WHERE p.id = auth.uid();

  RETURN QUERY
  SELECT
    m.id,
    m.body,
    m.created_at,
    m.edited_at,
    m.author_id = auth.uid() AS is_mine,
    CASE
      WHEN m.author_id = auth.uid() THEN 'Tú'
      WHEN v_viewer_company_id = v_owner_company_id THEN COALESCE(author.full_name, 'Usuario DTS')
      ELSE CONCAT(
        CASE author.role
          WHEN 'courier' THEN 'Mensajero'
          WHEN 'company_admin' THEN 'Supervisor'
          WHEN 'seller' THEN 'Vendedor'
          WHEN 'super_admin' THEN 'Administrador'
          ELSE 'Equipo'
        END,
        ' ',
        COALESCE(author_company.name, 'Agiliza')
      )
    END AS sender_label
  FROM public.chat_messages m
  JOIN public.profiles author ON author.id = m.author_id
  LEFT JOIN public.companies author_company ON author_company.id = author.company_id
  WHERE m.conversation_id = p_conversation_id
    AND m.deleted_at IS NULL
  ORDER BY m.created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_chat_messages(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';


-- Actualiza la campanita inmediatamente mediante Supabase Realtime.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

-- Categorías y participación de soporte.
-- Ejecutar este bloque junto con el resto de create-chat.sql.
ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'support';

ALTER TABLE public.chat_conversations
  DROP CONSTRAINT IF EXISTS chat_conversations_category_check;
ALTER TABLE public.chat_conversations
  ADD CONSTRAINT chat_conversations_category_check
  CHECK (category IN ('support', 'customer_service'));

UPDATE public.chat_conversations
SET category = 'support'
WHERE category IS NULL;

CREATE TABLE IF NOT EXISTS public.chat_conversation_participants (
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, profile_id)
);

-- Conserva el acceso a los autores EPS que ya participaron en soporte existente.
INSERT INTO public.chat_conversation_participants(conversation_id, profile_id)
SELECT DISTINCT m.conversation_id, m.author_id
FROM public.chat_messages m
JOIN public.chat_conversations c ON c.id = m.conversation_id
JOIN public.profiles p ON p.id = m.author_id
WHERE c.category = 'support'
  AND p.company_id = c.owner_company_id
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.can_access_chat(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_conversations c
    JOIN public.profiles viewer ON viewer.id = auth.uid()
    WHERE c.id = p_conversation_id
      AND viewer.active
      AND (
        -- DTS solo ve conversaciones de su empresa.
        viewer.company_id = c.client_company_id
        OR (
          viewer.company_id = c.owner_company_id
          AND (
            -- Servicio al cliente: solo administradores y supervisores EPS.
            (c.category = 'customer_service' AND viewer.role IN ('super_admin', 'company_admin'))
            OR
            -- Soporte: administradores/supervisores o participantes EPS de esa conversación.
            (c.category = 'support' AND (
              viewer.role IN ('super_admin', 'company_admin')
              OR EXISTS (
                SELECT 1
                FROM public.chat_conversation_participants participant
                WHERE participant.conversation_id = c.id
                  AND participant.profile_id = viewer.id
              )
            ))
          )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_write_chat(p_conversation_id uuid, p_template_key text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_conversations c
    JOIN public.profiles viewer ON viewer.id = auth.uid()
    WHERE c.id = p_conversation_id
      AND public.can_access_chat(c.id)
      AND (
        viewer.company_id = c.client_company_id
        OR viewer.company_id = c.owner_company_id
      )
      AND (
        viewer.company_id <> c.owner_company_id
        OR viewer.role <> 'courier'
        OR viewer.can_chat_directly_with_clients
        OR p_template_key IS NOT NULL
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.add_support_participant()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.chat_conversation_participants(conversation_id, profile_id)
  SELECT NEW.conversation_id, NEW.author_id
  FROM public.chat_conversations c
  JOIN public.profiles author ON author.id = NEW.author_id
  WHERE c.id = NEW.conversation_id
    AND c.category = 'support'
    AND author.company_id = c.owner_company_id
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chat_messages_add_support_participant ON public.chat_messages;
CREATE TRIGGER chat_messages_add_support_participant
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.add_support_participant();

DROP POLICY IF EXISTS chat_participants_access ON public.chat_conversation_participants;
ALTER TABLE public.chat_conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_participants_access ON public.chat_conversation_participants
  FOR SELECT USING (public.can_access_chat(conversation_id));

CREATE OR REPLACE FUNCTION public.get_or_create_shipment_chat(p_shipment_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_client_company uuid; v_owner_company uuid; v_conversation uuid;
BEGIN
  SELECT company_id INTO v_client_company FROM public.shipments WHERE id = p_shipment_id;
  IF v_client_company IS NULL THEN RAISE EXCEPTION 'El envío no existe.'; END IF;
  SELECT c.id INTO v_owner_company FROM public.companies c
    WHERE coalesce(c.is_owner_company, false) OR coalesce(c.is_system_company, false)
    ORDER BY c.created_at NULLS LAST LIMIT 1;
  IF v_owner_company IS NULL THEN RAISE EXCEPTION 'No existe una empresa propietaria configurada.'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.active AND p.company_id = v_owner_company
  ) THEN RAISE EXCEPTION 'Solo usuarios EPS pueden crear solicitudes de soporte.'; END IF;

  SELECT id INTO v_conversation FROM public.chat_conversations
  WHERE owner_company_id = v_owner_company
    AND client_company_id = v_client_company
    AND shipment_id = p_shipment_id
    AND category = 'support';
  IF v_conversation IS NULL THEN
    INSERT INTO public.chat_conversations(owner_company_id, client_company_id, shipment_id, subject, category)
    VALUES(v_owner_company, v_client_company, p_shipment_id, 'Soporte del envío', 'support')
    RETURNING id INTO v_conversation;
  END IF;

  INSERT INTO public.chat_conversation_participants(conversation_id, profile_id)
  VALUES(v_conversation, auth.uid())
  ON CONFLICT DO NOTHING;
  RETURN v_conversation;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_or_create_customer_service_chat(p_client_company_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_viewer_company uuid; v_owner_company uuid; v_client_company uuid; v_viewer_role public.user_role; v_conversation uuid;
BEGIN
  SELECT company_id, role INTO v_viewer_company, v_viewer_role
  FROM public.profiles WHERE id = auth.uid() AND active = true;
  IF v_viewer_company IS NULL THEN RAISE EXCEPTION 'Usuario no autorizado.'; END IF;

  SELECT c.id INTO v_owner_company FROM public.companies c
    WHERE coalesce(c.is_owner_company, false) OR coalesce(c.is_system_company, false)
    ORDER BY c.created_at NULLS LAST LIMIT 1;
  IF v_owner_company IS NULL THEN RAISE EXCEPTION 'No existe una empresa propietaria configurada.'; END IF;

  IF v_viewer_company = v_owner_company THEN
    IF v_viewer_role NOT IN ('super_admin', 'company_admin') THEN
      RAISE EXCEPTION 'Solo administradores o supervisores EPS acceden a servicio al cliente.';
    END IF;
    IF p_client_company_id IS NULL OR p_client_company_id = v_owner_company THEN
      RAISE EXCEPTION 'Seleccione una empresa cliente válida.';
    END IF;
    v_client_company := p_client_company_id;
  ELSE
    v_client_company := v_viewer_company;
  END IF;

  SELECT id INTO v_conversation FROM public.chat_conversations
  WHERE owner_company_id = v_owner_company
    AND client_company_id = v_client_company
    AND shipment_id IS NULL
    AND category = 'customer_service'
  ORDER BY updated_at DESC LIMIT 1;

  IF v_conversation IS NULL THEN
    INSERT INTO public.chat_conversations(owner_company_id, client_company_id, subject, category)
    VALUES(v_owner_company, v_client_company, 'Servicio al cliente', 'customer_service')
    RETURNING id INTO v_conversation;
  END IF;
  RETURN v_conversation;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_shipment_chat(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_customer_service_chat(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';

-- Paginación del historial: entrega los mensajes más recientes y permite solicitar anteriores.
DROP FUNCTION IF EXISTS public.get_chat_messages(uuid);
DROP FUNCTION IF EXISTS public.get_chat_messages(uuid, integer, timestamptz);
CREATE FUNCTION public.get_chat_messages(
  p_conversation_id uuid,
  p_limit integer DEFAULT 40,
  p_before timestamptz DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  body text,
  created_at timestamptz,
  edited_at timestamptz,
  is_mine boolean,
  sender_label text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viewer_company_id uuid;
  v_owner_company_id uuid;
BEGIN
  IF NOT public.can_access_chat(p_conversation_id) THEN
    RAISE EXCEPTION 'No tiene acceso a esta conversación.';
  END IF;

  SELECT p.company_id, c.owner_company_id
    INTO v_viewer_company_id, v_owner_company_id
  FROM public.profiles p
  JOIN public.chat_conversations c ON c.id = p_conversation_id
  WHERE p.id = auth.uid();

  RETURN QUERY
  WITH page AS (
    SELECT m.*
    FROM public.chat_messages m
    WHERE m.conversation_id = p_conversation_id
      AND m.deleted_at IS NULL
      AND (p_before IS NULL OR m.created_at < p_before)
    ORDER BY m.created_at DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 40), 1), 100)
  )
  SELECT
    m.id,
    m.body,
    m.created_at,
    m.edited_at,
    m.author_id = auth.uid() AS is_mine,
    CASE
      WHEN m.author_id = auth.uid() THEN 'Tú'
      WHEN v_viewer_company_id = v_owner_company_id THEN COALESCE(author.full_name, 'Usuario DTS')
      ELSE CONCAT(
        CASE author.role
          WHEN 'courier' THEN 'Mensajero'
          WHEN 'company_admin' THEN 'Supervisor'
          WHEN 'seller' THEN 'Vendedor'
          WHEN 'super_admin' THEN 'Administrador'
          ELSE 'Equipo'
        END,
        ' ',
        COALESCE(author_company.name, 'Agiliza')
      )
    END AS sender_label
  FROM page m
  JOIN public.profiles author ON author.id = m.author_id
  LEFT JOIN public.companies author_company ON author_company.id = author.company_id
  ORDER BY m.created_at ASC;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_chat_messages(uuid, integer, timestamptz) TO authenticated;
NOTIFY pgrst, 'reload schema';


-- Vista previa del último mensaje recibido por conversación, respetando RLS de chat.
CREATE OR REPLACE FUNCTION public.get_chat_conversation_previews()
RETURNS TABLE(conversation_id uuid, preview text, received_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    c.id AS conversation_id,
    COALESCE(last_message.body, 'Ubicación o adjunto') AS preview,
    last_message.created_at AS received_at
  FROM public.chat_conversations c
  JOIN LATERAL (
    SELECT m.body, m.created_at
    FROM public.chat_messages m
    WHERE m.conversation_id = c.id
      AND m.author_id <> auth.uid()
      AND m.deleted_at IS NULL
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_message ON true
  WHERE public.can_access_chat(c.id);
$$;
GRANT EXECUTE ON FUNCTION public.get_chat_conversation_previews() TO authenticated;
NOTIFY pgrst, 'reload schema';


-- Edición y eliminación lógica de mensajes, con auditoría.
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS deleted_by uuid NULL REFERENCES public.profiles(id);

CREATE TABLE IF NOT EXISTS public.chat_message_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('edited', 'deleted')),
  previous_body text NULL,
  actor_id uuid NOT NULL REFERENCES public.profiles(id),
  occurred_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_message_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS chat_message_audit_owner_access ON public.chat_message_audit;
CREATE POLICY chat_message_audit_owner_access ON public.chat_message_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages m
      JOIN public.chat_conversations c ON c.id = m.conversation_id
      JOIN public.profiles viewer ON viewer.id = auth.uid()
      WHERE m.id = chat_message_audit.message_id
        AND viewer.active
        AND viewer.company_id = c.owner_company_id
        AND viewer.role IN ('super_admin', 'company_admin')
    )
  );

-- Las actualizaciones pasan únicamente por la función con límite de 15 minutos.
DROP POLICY IF EXISTS chat_messages_update ON public.chat_messages;

CREATE OR REPLACE FUNCTION public.edit_chat_message(p_message_id uuid, p_body text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_conversation_id uuid;
  v_author_id uuid;
  v_created_at timestamptz;
  v_deleted_at timestamptz;
  v_previous_body text;
BEGIN
  SELECT conversation_id, author_id, created_at, deleted_at, body
    INTO v_conversation_id, v_author_id, v_created_at, v_deleted_at, v_previous_body
  FROM public.chat_messages WHERE id = p_message_id;
  IF v_conversation_id IS NULL OR NOT public.can_access_chat(v_conversation_id) THEN RAISE EXCEPTION 'No tiene acceso a este mensaje.'; END IF;
  IF v_author_id <> auth.uid() THEN RAISE EXCEPTION 'Solo puede editar sus propios mensajes.'; END IF;
  IF v_deleted_at IS NOT NULL THEN RAISE EXCEPTION 'No puede editar un mensaje eliminado.'; END IF;
  IF v_created_at < now() - interval '15 minutes' THEN RAISE EXCEPTION 'El plazo de 15 minutos para editar este mensaje ya venció.'; END IF;
  IF nullif(btrim(p_body), '') IS NULL THEN RAISE EXCEPTION 'El mensaje no puede quedar vacío.'; END IF;
  IF btrim(p_body) IS NOT DISTINCT FROM v_previous_body THEN RETURN; END IF;
  INSERT INTO public.chat_message_audit(message_id, action, previous_body, actor_id)
  VALUES(p_message_id, 'edited', v_previous_body, auth.uid());
  UPDATE public.chat_messages SET body = btrim(p_body), edited_at = now() WHERE id = p_message_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_chat_message(p_message_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_conversation_id uuid;
  v_author_id uuid;
  v_deleted_at timestamptz;
  v_previous_body text;
  v_viewer_company uuid;
  v_owner_company uuid;
  v_viewer_role public.user_role;
BEGIN
  SELECT m.conversation_id, m.author_id, m.deleted_at, m.body, viewer.company_id, c.owner_company_id, viewer.role
    INTO v_conversation_id, v_author_id, v_deleted_at, v_previous_body, v_viewer_company, v_owner_company, v_viewer_role
  FROM public.chat_messages m
  JOIN public.chat_conversations c ON c.id = m.conversation_id
  JOIN public.profiles viewer ON viewer.id = auth.uid()
  WHERE m.id = p_message_id;
  IF v_conversation_id IS NULL OR NOT public.can_access_chat(v_conversation_id) THEN RAISE EXCEPTION 'No tiene acceso a este mensaje.'; END IF;
  IF v_deleted_at IS NOT NULL THEN RETURN; END IF;
  IF v_author_id <> auth.uid() AND NOT (v_viewer_company = v_owner_company AND v_viewer_role IN ('super_admin', 'company_admin')) THEN
    RAISE EXCEPTION 'No tiene permiso para eliminar este mensaje.';
  END IF;
  INSERT INTO public.chat_message_audit(message_id, action, previous_body, actor_id)
  VALUES(p_message_id, 'deleted', v_previous_body, auth.uid());
  UPDATE public.chat_messages SET deleted_at = now(), deleted_by = auth.uid() WHERE id = p_message_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.edit_chat_message(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_chat_message(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';

-- Estado de edición/eliminación para la interfaz paginada.
DROP FUNCTION IF EXISTS public.get_chat_messages(uuid, integer, timestamptz);
CREATE FUNCTION public.get_chat_messages(
  p_conversation_id uuid,
  p_limit integer DEFAULT 40,
  p_before timestamptz DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  body text,
  created_at timestamptz,
  edited_at timestamptz,
  deleted_at timestamptz,
  is_mine boolean,
  can_edit boolean,
  can_delete boolean,
  sender_label text,
  deleted_by_label text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_viewer_company_id uuid;
  v_owner_company_id uuid;
  v_viewer_role public.user_role;
BEGIN
  IF NOT public.can_access_chat(p_conversation_id) THEN RAISE EXCEPTION 'No tiene acceso a esta conversación.'; END IF;
  SELECT p.company_id, c.owner_company_id, p.role
    INTO v_viewer_company_id, v_owner_company_id, v_viewer_role
  FROM public.profiles p JOIN public.chat_conversations c ON c.id = p_conversation_id
  WHERE p.id = auth.uid();

  RETURN QUERY
  WITH page AS (
    SELECT m.* FROM public.chat_messages m
    WHERE m.conversation_id = p_conversation_id
      AND (p_before IS NULL OR m.created_at < p_before)
    ORDER BY m.created_at DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 40), 1), 100)
  )
  SELECT
    m.id,
    CASE WHEN m.deleted_at IS NULL THEN m.body ELSE 'Mensaje eliminado' END,
    m.created_at,
    m.edited_at,
    m.deleted_at,
    m.author_id = auth.uid(),
    m.deleted_at IS NULL AND m.author_id = auth.uid() AND m.created_at >= now() - interval '15 minutes',
    m.deleted_at IS NULL AND (m.author_id = auth.uid() OR (v_viewer_company_id = v_owner_company_id AND v_viewer_role IN ('super_admin', 'company_admin'))),
    CASE
      WHEN m.author_id = auth.uid() THEN 'Tú'
      WHEN v_viewer_company_id = v_owner_company_id THEN COALESCE(author.full_name, 'Usuario DTS')
      ELSE CONCAT(CASE author.role
        WHEN 'courier' THEN 'Mensajero'
        WHEN 'company_admin' THEN 'Supervisor'
        WHEN 'seller' THEN 'Vendedor'
        WHEN 'super_admin' THEN 'Administrador'
        ELSE 'Equipo' END, ' ', COALESCE(author_company.name, 'Agiliza'))
    END,
    CASE
      WHEN m.deleted_at IS NULL OR m.deleted_by IS NULL OR m.deleted_by = m.author_id THEN NULL
      WHEN v_viewer_company_id = v_owner_company_id THEN COALESCE(deleter.full_name, 'Administrador EPS')
      ELSE CONCAT('un ', CASE deleter.role
        WHEN 'company_admin' THEN 'supervisor'
        WHEN 'super_admin' THEN 'administrador'
        ELSE 'administrador'
      END)
    END
  FROM page m
  JOIN public.profiles author ON author.id = m.author_id
  LEFT JOIN public.companies author_company ON author_company.id = author.company_id
  LEFT JOIN public.profiles deleter ON deleter.id = m.deleted_by
  ORDER BY m.created_at ASC;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_chat_messages(uuid, integer, timestamptz) TO authenticated;
NOTIFY pgrst, 'reload schema';

-- Soporte permite que cualquier usuario EPS activo escriba en su propia conversación.
-- La restricción de mensajes preestablecidos se mantiene para conversaciones externas
-- distintas de soporte, y no tiene relación con editar o eliminar mensajes.
CREATE OR REPLACE FUNCTION public.can_write_chat(p_conversation_id uuid, p_template_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_conversations c
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE c.id = p_conversation_id
      AND p.active
      AND (
        p.company_id = c.client_company_id
        OR (
          p.company_id = c.owner_company_id
          AND (
            p.role <> 'courier'
            OR p.can_chat_directly_with_clients
            OR c.category = 'support'
            OR p_template_key IS NOT NULL
          )
        )
      )
  );
$$;
GRANT EXECUTE ON FUNCTION public.can_write_chat(uuid, text) TO authenticated;
NOTIFY pgrst, 'reload schema';
