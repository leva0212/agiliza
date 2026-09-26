"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, MapPin, Paperclip, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CompanyReference = { name: string; is_owner_company?: boolean } | null;
type Conversation = {
  id: string;
  subject: string | null;
  shipment_id: string | null;
  client_company: CompanyReference;
  owner_company: CompanyReference;
  shipment: { tracking_number: string } | null;
};
type Message = { id: string; body: string | null; created_at: string; edited_at: string | null; is_mine: boolean; sender_label: string };

const templates = [
  "Estoy intentando coordinar con este cliente pero no me contesta",
  "Cliente quedó en enviar la ubicación pero no la ha enviado",
  "Cliente indica que programe la entrega para otro día",
  "El número proporcionado no responde llamadas ni mensajes",
  "Necesito apoyo del supervisor para este envío",
];


export default function ChatPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get("shipmentId");
  const conversationId = searchParams.get("conversationId");
  const returnTo = searchParams.get("returnTo");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [body, setBody] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(!shipmentId);

  const loadUnreadCounts = async () => {
    const { data } = await supabase.rpc("get_unread_chat_notifications");
    const counts = ((data ?? []) as Array<{ conversation_id: string; unread_count: number }>).reduce<Record<string, number>>((result, item) => {
      result[item.conversation_id] = Number(item.unread_count);
      return result;
    }, {});
    setUnreadCounts(counts);
  };
  const loadMessages = async (id: string) => {
    const { data, error } = await supabase.rpc("get_chat_messages", { p_conversation_id: id });
    if (error) {
      console.error("[Chat] Error al cargar mensajes:", error);
      setMessagesError(error.message);
      setMessages([]);
      return;
    }
    setMessagesError(null);
    setMessages((data ?? []) as Message[]);
  };

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: me } = await supabase
        .from("profiles")
        .select("id,full_name,role,company_id,can_chat_directly_with_clients,company:companies(name,is_owner_company)")
        .eq("id", user.id)
        .single();
      setProfile(me);

      let selected: string | null = conversationId;
      if (shipmentId) {
        const { data } = await supabase.rpc("get_or_create_shipment_chat", { p_shipment_id: shipmentId });
        selected = data ?? null;
      }

      const { data } = await supabase
        .from("chat_conversations")
        .select("id,subject,shipment_id,client_company:companies!chat_conversations_client_company_id_fkey(name),owner_company:companies!chat_conversations_owner_company_id_fkey(name),shipment:shipments(tracking_number)")
        .order("updated_at", { ascending: false });
      const list = (data ?? []) as unknown as Conversation[];
      setConversations(list);
      await loadUnreadCounts();
      const chosen = list.find((conversation) => conversation.id === selected) ?? list[0] ?? null;
      setActive(chosen);
      if (chosen) {
        await loadMessages(chosen.id);
        await supabase.rpc("mark_chat_conversation_read", { p_conversation_id: chosen.id });
        setUnreadCounts((current) => ({ ...current, [chosen.id]: 0 }));
      }
      setLoading(false);
    })();
  }, [shipmentId, conversationId]);

  useEffect(() => {
    const channel = supabase
      .channel("chat-list-unread-counts")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => void loadUnreadCounts())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);
  useEffect(() => {
    if (!active) return;

    const channel = supabase
      .channel(`chat-conversation-${active.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${active.id}` },
        async () => {
          await loadMessages(active.id);
          await supabase.rpc("mark_chat_conversation_read", { p_conversation_id: active.id });
          setUnreadCounts((current) => ({ ...current, [active.id]: 0 }));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [active?.id]);
  const choose = async (conversation: Conversation) => {
    setActive(conversation);
    setShowList(false);
    await loadMessages(conversation.id);
    await supabase.rpc("mark_chat_conversation_read", { p_conversation_id: conversation.id });
    setUnreadCounts((current) => ({ ...current, [conversation.id]: 0 }));
  };

  const send = async (template?: string) => {
    const text = template ?? body.trim();
    if (!active || !profile || !text) return;
    const restricted = profile.role === "courier" && !profile.can_chat_directly_with_clients;
    if (restricted && !template) return;

    const { error } = await supabase.from("chat_messages").insert({
      conversation_id: active.id,
      author_id: profile.id,
      body: text,
      template_key: template ? "courier_status" : null,
    });
    if (!error) {
      setBody("");
      await loadMessages(active.id);
    }
  };

  if (loading) return <div className="p-6">Cargando conversaciones…</div>;

  const company = Array.isArray(profile?.company) ? profile.company[0] ?? null : profile?.company;
  const isOwnerCompanyUser = company?.is_owner_company === true;
  const title = active?.shipment?.tracking_number ? `Envío ${active.shipment.tracking_number}` : active?.subject ?? "Conversación";
  const ownerCompany = active?.owner_company?.name ?? "Agiliza";
  const clientCompany = active?.client_company?.name ?? "Empresa cliente";
  // DTS sees the EPS company and role, never an EPS employee's personal name.
  const participantLabel = isOwnerCompanyUser
    ? `${profile?.full_name ?? "Usuario"} — ${clientCompany}`
    : `Equipo ${ownerCompany}`;
  const isRestrictedCourier = profile?.role === "courier" && !profile?.can_chat_directly_with_clients;

  return (
    <div className="grid h-[calc(100dvh-5rem)] min-h-0 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:h-[calc(100vh-5rem)] md:grid-cols-[320px_1fr]">
      <aside className={`${showList ? "block" : "hidden"} border-b border-slate-200 dark:border-slate-700 md:block md:border-b-0 md:border-r`}>
        <div className="p-4">
          <h2 className="font-bold">Conversaciones</h2>
          <p className="text-xs text-slate-500">{participantLabel}</p>
        </div>
        {conversations.map((conversation) => (
          <button key={conversation.id} onClick={() => void choose(conversation)} className={`block w-full border-t p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${active?.id === conversation.id ? "bg-sky-50 dark:bg-sky-950/30" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{conversation.shipment?.tracking_number ? `Envío ${conversation.shipment.tracking_number}` : conversation.subject ?? "Conversación general"}</p>
              {unreadCounts[conversation.id] > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">{unreadCounts[conversation.id] > 99 ? "99+" : unreadCounts[conversation.id]}</span>}
            </div>
            <p className="text-xs text-slate-500">{isOwnerCompanyUser ? conversation.client_company?.name ?? "Empresa cliente" : conversation.owner_company?.name ?? "Agiliza"}</p>
          </button>
        ))}
        {!conversations.length && <p className="p-4 text-sm text-slate-500">No hay conversaciones disponibles.</p>}
      </aside>

      <main className={`${showList ? "hidden" : "flex"} min-h-0 flex-1 flex-col md:flex`}>
        <header className="flex items-center gap-2 border-b p-4 dark:border-slate-700">
          {returnTo && <button onClick={() => router.push(returnTo)} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500 bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700" aria-label="Volver al envío" title="Volver al envío"><ArrowLeft size={18} /><span className="hidden sm:inline">Volver al envío</span></button>}
          <button onClick={() => setShowList(true)} className="rounded-lg border p-2 md:hidden" aria-label="Ver conversaciones"><ChevronLeft size={18} /></button>
          <div>
            <h1 className="font-bold">{title}</h1>
            <p className="text-xs text-slate-500">{participantLabel} · Comunicación registrada para auditoría.</p>
          </div>
        </header>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/40">
          {messagesError && <p className="rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">No fue posible cargar los mensajes: {messagesError}</p>}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.is_mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2.5 shadow-sm ${message.is_mine ? "rounded-br-sm bg-emerald-600 text-white" : "rounded-bl-sm bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100"}`}>
                <p className={`mb-1 text-xs font-semibold ${message.is_mine ? "text-emerald-100" : "text-sky-700 dark:text-sky-300"}`}>{message.sender_label}</p>
                <p className="whitespace-pre-wrap">{message.body}</p>
                <p className={`mt-1 text-right text-[11px] ${message.is_mine ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"}`}>{new Date(message.created_at).toLocaleString("es-CR")}{message.edited_at ? " · Editado" : ""}</p>
              </div>
            </div>
          ))}
        </div>
        <footer className="shrink-0 border-t p-3 dark:border-slate-700">
          {isRestrictedCourier && <div className="mb-2 flex flex-wrap gap-2">{templates.map((template) => <button key={template} onClick={() => void send(template)} className="rounded-full border border-sky-300 px-3 py-1 text-xs text-sky-700 dark:text-sky-300">{template}</button>)}</div>}
          <div className="flex gap-2 sm:hidden">
            <button aria-label="Enviar ubicación" className="rounded-lg border p-2.5" disabled><MapPin size={18} /></button>
            <button aria-label="Adjuntar foto" className="rounded-lg border p-2.5" disabled><Paperclip size={18} /></button>
          </div>
          <div className="mt-2 flex items-end gap-2 sm:mt-0">
            <div className="hidden gap-2 sm:flex">
              <button aria-label="Enviar ubicación" className="rounded-lg border p-3" disabled><MapPin size={18} /></button>
              <button aria-label="Adjuntar foto" className="rounded-lg border p-3" disabled><Paperclip size={18} /></button>
            </div>
            <textarea
              disabled={!active || isRestrictedCourier}
              value={body}
              rows={1}
              onChange={(event) => {
                setBody(event.target.value);
                event.currentTarget.style.height = "auto";
                event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 128)}px`;
              }}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }}
              placeholder={isRestrictedCourier ? "Use un mensaje preestablecido" : "Escribe un mensaje"}
              className="max-h-32 min-h-14 flex-1 resize-none overflow-y-auto rounded-2xl border px-4 py-3 text-base leading-6 dark:bg-slate-950"
            />
            <button onClick={() => void send()} disabled={!body.trim() || !active} className="flex size-14 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white disabled:opacity-50"><Send size={20} /></button>
          </div>
        </footer>
      </main>
    </div>
  );
}













