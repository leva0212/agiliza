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
