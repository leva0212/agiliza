"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, MapPin, Paperclip, Pencil, Send, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatElapsedTime } from "@/shared/utils/format-elapsed-time";
import { UiMessage } from "@/shared/components/ui-message";

type CompanyReference = { name: string; is_owner_company?: boolean } | null;
type Conversation = {
  id: string;
  subject: string | null;
  shipment_id: string | null;
  category: "support" | "customer_service";
  client_company: CompanyReference;
  owner_company: CompanyReference;
  shipment: { tracking_number: string } | null;
};
type Message = { id: string; body: string | null; created_at: string; edited_at: string | null; deleted_at: string | null; is_mine: boolean; can_edit: boolean; can_delete: boolean; sender_label: string; deleted_by_label: string | null };

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
  const [hasMoreConversations, setHasMoreConversations] = useState<Record<Conversation["category"], boolean>>({ support: true, customer_service: true });
  const [loadingMoreConversations, setLoadingMoreConversations] = useState<Record<Conversation["category"], boolean>>({ support: false, customer_service: false });
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastUnreadAt, setLastUnreadAt] = useState<Record<string, string>>({});
  const [conversationPreviews, setConversationPreviews] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(!shipmentId && !conversationId);
  const [category, setCategory] = useState<"support" | "customer_service">("support");
  const [customerCompanies, setCustomerCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCustomerCompanyId, setSelectedCustomerCompanyId] = useState("");
  const [creatingCustomerService, setCreatingCustomerService] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [newIncomingCount, setNewIncomingCount] = useState(0);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageBody, setEditingMessageBody] = useState("");
  const [actionMessageId, setActionMessageId] = useState<string | null>(null);
  const [messagePendingDeletion, setMessagePendingDeletion] = useState<Message | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const mobileChatHistoryEntryRef = useRef(false);
  const messageLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  const loadUnreadCounts = async () => {
    const { data } = await supabase.rpc("get_unread_chat_notifications");
    const pending = (data ?? []) as Array<{ conversation_id: string; unread_count: number; last_message_at: string }>;
    const counts = pending.reduce<Record<string, number>>((result, item) => {
      result[item.conversation_id] = Number(item.unread_count);
      return result;
    }, {});
    const arrivals = pending.reduce<Record<string, string>>((result, item) => {
      result[item.conversation_id] = item.last_message_at;
      return result;
    }, {});
    setUnreadCounts(counts);
    setLastUnreadAt(arrivals);
  };
  const loadConversationPreviews = async () => {
    const { data } = await supabase.rpc("get_chat_conversation_previews");
    const previews = ((data ?? []) as Array<{ conversation_id: string; preview: string }>).reduce<Record<string, string>>((result, item) => {
      result[item.conversation_id] = item.preview;
      return result;
    }, {});
    setConversationPreviews(previews);
  };
  const conversationSelect = "id,subject,shipment_id,category,client_company:companies!chat_conversations_client_company_id_fkey(name),owner_company:companies!chat_conversations_owner_company_id_fkey(name),shipment:shipments(tracking_number)";
  const loadConversationPage = async (targetCategory: Conversation["category"], reset = false, selectedConversation?: Conversation | null) => {
    if (!reset && (loadingMoreConversations[targetCategory] || !hasMoreConversations[targetCategory])) return;
    const currentCount = reset ? 0 : conversations.filter((conversation) => conversation.category === targetCategory).length;
    setLoadingMoreConversations((current) => ({ ...current, [targetCategory]: true }));
    const { data, error } = await supabase
      .from("chat_conversations")
      .select(conversationSelect)
      .eq("category", targetCategory)
      .order("updated_at", { ascending: false })
      .range(currentCount, currentCount + 24);
    if (error) setMessagesError(error.message);
    const page = (data ?? []) as unknown as Conversation[];
    setConversations((current) => {
      const previous = reset ? current.filter((conversation) => conversation.category !== targetCategory) : current;
      const candidates = selectedConversation && selectedConversation.category === targetCategory ? [selectedConversation, ...page] : page;
      return [...previous, ...candidates.filter((candidate, index, all) => !previous.some((conversation) => conversation.id === candidate.id) && all.findIndex((conversation) => conversation.id === candidate.id) === index)];
    });
    setHasMoreConversations((current) => ({ ...current, [targetCategory]: page.length === 25 }));
    setLoadingMoreConversations((current) => ({ ...current, [targetCategory]: false }));
  };
  const loadMessages = async (id: string, options?: { before?: string; prepend?: boolean }) => {
    const { data, error } = await supabase.rpc("get_chat_messages", {
      p_conversation_id: id,
      p_limit: 40,
      p_before: options?.before ?? null,
    });
    if (error) {
      console.error("[Chat] Error al cargar mensajes:", error);
      setMessagesError(error.message);
      if (!options?.prepend) setMessages([]);
      return;
    }
    const page = (data ?? []) as Message[];
    setMessagesError(null);
    setHasMoreMessages(page.length === 40);
    setMessages((current) => options?.prepend
      ? [...page, ...current.filter((message) => !page.some((older) => older.id === message.id))]
      : page);
  };

  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    return !container || container.scrollHeight - container.scrollTop - container.clientHeight < 56;
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  };

  const markConversationRead = async (id: string) => {
    await supabase.rpc("mark_chat_conversation_read", { p_conversation_id: id });
    setUnreadCounts((current) => ({ ...current, [id]: 0 }));
    window.dispatchEvent(new Event("chat-messages-read"));
  };

  const openNewMessages = async () => {
    if (firstUnreadMessageId) document.getElementById(`chat-message-${firstUnreadMessageId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (active) await markConversationRead(active.id);
    setNewIncomingCount(0);
    setFirstUnreadMessageId(null);
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
      const myCompany = Array.isArray(me?.company) ? me.company[0] ?? null : me?.company;
      if (myCompany?.is_owner_company && ["super_admin", "company_admin"].includes(me?.role ?? "")) {
        const { data: companies } = await supabase.from("companies").select("id,name").or("is_owner_company.is.null,is_owner_company.eq.false").order("name");
        setCustomerCompanies((companies ?? []) as Array<{ id: string; name: string }>);
      }

      let selected: string | null = conversationId;
      if (shipmentId) {
        const { data } = await supabase.rpc("get_or_create_shipment_chat", { p_shipment_id: shipmentId });
        selected = data ?? null;
      }

      let chosen: Conversation | null = null;
      if (selected) {
        const { data } = await supabase
          .from("chat_conversations")
          .select(conversationSelect)
          .eq("id", selected)
          .maybeSingle();
        chosen = data as unknown as Conversation | null;
      }
      const initialCategory = chosen?.category ?? "support";
      setCategory(initialCategory);
      await loadConversationPage(initialCategory, true, chosen);
      await Promise.all([loadUnreadCounts(), loadConversationPreviews()]);
      setActive(chosen);
      const chatIsVisible = typeof window === "undefined" || window.innerWidth >= 768 || !showList;
      if (chosen && chatIsVisible) {
        await loadMessages(chosen.id);
        await markConversationRead(chosen.id);
        requestAnimationFrame(scrollToBottom);
      }      setLoading(false);
    })();
  }, [shipmentId, conversationId]);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 768 || showList || !active || mobileChatHistoryEntryRef.current) return;
    window.history.pushState({ chatList: true }, "");
    mobileChatHistoryEntryRef.current = true;
  }, [showList, active?.id]);

  useEffect(() => {
    const onPopState = () => {
      if (window.innerWidth < 768 && mobileChatHistoryEntryRef.current && !showList) {
        mobileChatHistoryEntryRef.current = false;
        setShowList(true);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [showList]);
  useEffect(() => {
    const channel = supabase
      .channel("chat-list-unread-counts")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => { void loadUnreadCounts(); void loadConversationPreviews(); })
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
async (payload) => {
          if (window.innerWidth < 768 && showList) {
            await Promise.all([loadUnreadCounts(), loadConversationPreviews()]);
            return;
          }
          const incoming = (payload as { new?: { author_id?: string; id?: string } }).new;
          const shouldKeepUnread = incoming?.author_id !== profile?.id && !isNearBottom();
          await loadMessages(active.id);
          if (shouldKeepUnread) {
            setNewIncomingCount((count) => count + 1);
            setFirstUnreadMessageId((current) => current ?? incoming?.id ?? null);
          } else {
            await markConversationRead(active.id);
            requestAnimationFrame(scrollToBottom);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [active?.id, showList]);
  const choose = async (conversation: Conversation) => {
    setActive(conversation);
    setCategory(conversation.category);
    setShowList(false);
    await loadMessages(conversation.id);
    await markConversationRead(conversation.id);
    setNewIncomingCount(0);
    setFirstUnreadMessageId(null);
    setActionMessageId(null);
    setEditingMessageId(null);
    requestAnimationFrame(scrollToBottom);
  };

  const saveMessageEdit = async (message: Message) => {
    const { error } = await supabase.rpc("edit_chat_message", { p_message_id: message.id, p_body: editingMessageBody });
    if (error) {
      setMessagesError(error.message);
      return;
    }
    setEditingMessageId(null);
    setEditingMessageBody("");
    setActionMessageId(null);
    if (active) await loadMessages(active.id);
  };

  const deleteMessage = async (message: Message) => {
    const { error } = await supabase.rpc("delete_chat_message", { p_message_id: message.id });
    if (error) {
      setMessagesError(error.message);
      return;
    }
    setMessagePendingDeletion(null);
    setActionMessageId(null);
    if (active) await loadMessages(active.id);
  };
  const createCustomerService = async () => {
    setCreatingCustomerService(true);
    const companyId = isOwnerCompanyUser ? selectedCustomerCompanyId || null : null;
    const { data: id, error } = await supabase.rpc("get_or_create_customer_service_chat", { p_client_company_id: companyId });
    if (error || !id) {
      setMessagesError(error?.message ?? "No fue posible crear la conversación de servicio al cliente.");
      setCreatingCustomerService(false);
      return;
    }
    const { data } = await supabase
      .from("chat_conversations")
      .select("id,subject,shipment_id,category,client_company:companies!chat_conversations_client_company_id_fkey(name),owner_company:companies!chat_conversations_owner_company_id_fkey(name),shipment:shipments(tracking_number)")
      .eq("id", id)
      .single();
    const conversation = data as unknown as Conversation | null;
    if (conversation) {
      setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]);
      setActive(conversation);
      setCategory("customer_service");
      setShowList(false);
      await loadMessages(conversation.id);
    }
    setCreatingCustomerService(false);
  };
  const send = async (template?: string) => {
    const text = template ?? body.trim();
    if (!active || !profile || !text) return;
    const restricted = profile.role === "courier" && !profile.can_chat_directly_with_clients && active.category !== "support";
    if (restricted && !template) return;

    const { error } = await supabase.from("chat_messages").insert({
      conversation_id: active.id,
      author_id: profile.id,
      body: text,
      template_key: template ? "courier_status" : null,
    });
    if (error) {
      setMessagesError(error.message);
      return;
    }
    setBody("");
    await loadMessages(active.id);
    requestAnimationFrame(scrollToBottom);
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
  const canUseCustomerService = !isOwnerCompanyUser || ["super_admin", "company_admin"].includes(profile?.role ?? "");
  const visibleConversations = conversations.filter((conversation) => conversation.category === category);
  const messageGroups = messages.reduce<Array<{ key: string; label: string; messages: Message[] }>>((groups, message) => {
    const date = new Date(message.created_at);
    const key = [date.getFullYear(), date.getMonth(), date.getDate()].join("-");
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      const todayDate = new Date();
      const todayKey = [todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()].join("-");
      const yesterdayDate = new Date(todayDate); yesterdayDate.setDate(todayDate.getDate() - 1);
      const yesterdayKey = [yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate()].join("-");
      group = { key, label: key === todayKey ? "Hoy" : key === yesterdayKey ? "Ayer" : date.toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" }), messages: [] };
      groups.push(group);
    }
    group.messages.push(message);
    return groups;
  }, []);
  const clearMessageLongPress = () => {
    if (messageLongPressTimerRef.current) clearTimeout(messageLongPressTimerRef.current);
    messageLongPressTimerRef.current = null;
  };
  const startMessageLongPress = (message: Message) => {
    if (message.deleted_at || (!message.can_edit && !message.can_delete)) return;
    clearMessageLongPress();
    messageLongPressTimerRef.current = setTimeout(() => setActionMessageId(message.id), 550);
  };

  return (
    <>
    <div className="grid h-[calc(100dvh-5rem)] min-h-0 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:h-[calc(100vh-5rem)] md:grid-cols-[320px_1fr]">
      <aside className={`${showList ? "flex" : "hidden"} min-h-0 flex-col overflow-hidden border-b border-slate-200 dark:border-slate-700 md:flex md:border-b-0 md:border-r`}>
        <div className="shrink-0 border-b border-slate-200 bg-slate-100/80 p-4 dark:border-slate-700 dark:bg-slate-800/70">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">Centro de mensajes</p>
          <h2 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-slate-100">Conversaciones</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{participantLabel}</p>
          <div className="mt-3 flex gap-1 rounded-xl border border-slate-300 bg-slate-100 p-1.5 dark:border-slate-700 dark:bg-slate-900">
            <button type="button" onClick={() => { setCategory("support"); void loadConversationPage("support", true); }} aria-pressed={category === "support"} className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition ${category === "support" ? "bg-sky-600 text-white shadow-md ring-1 ring-sky-400" : "border border-transparent text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}>Soporte</button>
            {canUseCustomerService && <button type="button" onClick={() => { setCategory("customer_service"); void loadConversationPage("customer_service", true); }} aria-pressed={category === "customer_service"} className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition ${category === "customer_service" ? "bg-sky-600 text-white shadow-md ring-1 ring-sky-400" : "border border-transparent text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}>Servicio al cliente</button>}
          </div>
          {category === "customer_service" && canUseCustomerService && <div className="mt-3 space-y-2">
            {isOwnerCompanyUser && <select value={selectedCustomerCompanyId} onChange={(event) => setSelectedCustomerCompanyId(event.target.value)} className="w-full rounded-lg border bg-transparent px-2 py-1.5 text-xs"><option value="">Seleccione empresa DTS</option>{customerCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select>}
            <button type="button" disabled={creatingCustomerService || (isOwnerCompanyUser && !selectedCustomerCompanyId)} onClick={() => void createCustomerService()} className="w-full rounded-lg border border-sky-500 px-2 py-1.5 text-xs font-semibold text-sky-700 disabled:opacity-50 dark:text-sky-300">{creatingCustomerService ? "Abriendo…" : "Abrir servicio al cliente"}</button>
          </div>}
        </div>
        <div onScroll={(event) => { const list = event.currentTarget; if (hasMoreConversations[category] && !loadingMoreConversations[category] && list.scrollHeight - list.scrollTop - list.clientHeight < 160) void loadConversationPage(category); }} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {visibleConversations.map((conversation) => (
          <button key={conversation.id} onClick={() => void choose(conversation)} className={`block w-full border-t p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${active?.id === conversation.id ? "border-l-4 border-l-sky-500 bg-sky-100 shadow-sm dark:bg-sky-900/70" : "border-l-4 border-l-transparent"}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{conversation.shipment?.tracking_number ? `Envío ${conversation.shipment.tracking_number}` : conversation.subject ?? "Conversación general"}</p>
              {unreadCounts[conversation.id] > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">{unreadCounts[conversation.id] > 99 ? "99+" : unreadCounts[conversation.id]}</span>}
            </div>
            <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">{isOwnerCompanyUser ? conversation.client_company?.name ?? "Empresa cliente" : conversation.owner_company?.name ?? "Agiliza"}</p>{conversationPreviews[conversation.id] && <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{conversationPreviews[conversation.id]}</p>}{unreadCounts[conversation.id] > 0 && lastUnreadAt[conversation.id] && <p className="mt-0.5 text-xs font-medium text-sky-700 dark:text-sky-300">{formatElapsedTime(lastUnreadAt[conversation.id])}</p>}
          </button>
        ))}
        {!visibleConversations.length && <p className="p-4 text-sm text-slate-500">No hay conversaciones de {category === "support" ? "soporte" : "servicio al cliente"} disponibles.</p>}
        {loadingMoreConversations[category] && <p className="p-4 text-center text-xs text-slate-500">Cargando más conversaciones…</p>}
        {!loadingMoreConversations[category] && hasMoreConversations[category] && visibleConversations.length > 0 && <p className="p-4 text-center text-xs text-slate-500">Desliza para cargar más conversaciones</p>}
        </div>
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
        <div ref={messagesContainerRef} onScroll={() => { if (newIncomingCount > 0 && isNearBottom()) void openNewMessages(); }} className="relative min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/40">
          {hasMoreMessages && messages[0] && <div className="flex justify-center"><button type="button" onClick={() => void loadMessages(active!.id, { before: messages[0].created_at, prepend: true })} className="rounded-full border border-sky-400 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/40">Cargar mensajes anteriores</button></div>}
          {messagesError && <p className="rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">No fue posible cargar los mensajes: {messagesError}</p>}
          {!active && <div className="grid h-full place-items-center text-center text-sm text-slate-500"><p>Seleccione una conversación para ver sus mensajes.</p></div>}
          {messageGroups.map((group) => (
            <section key={group.key} className="space-y-3">
              <div className="sticky top-0 z-10 flex justify-center py-1"><span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">{group.label}</span></div>
              {group.messages.map((message) => (
                <div id={`chat-message-${message.id}`} key={message.id} className={`flex ${message.is_mine ? "justify-end" : "justify-start"}`}>
                  <div
                    onPointerDown={() => startMessageLongPress(message)}
                    onPointerUp={clearMessageLongPress}
                    onPointerLeave={clearMessageLongPress}
                    onPointerCancel={clearMessageLongPress}
                    onContextMenu={(event) => { if (!message.deleted_at && (message.can_edit || message.can_delete)) { event.preventDefault(); setActionMessageId(message.id); } }}
                    className={`max-w-[80%] select-none rounded-2xl px-3 py-2.5 shadow-sm ${message.is_mine ? "rounded-br-sm bg-emerald-600 text-white" : "rounded-bl-sm bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100"}`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold ${message.is_mine ? "text-emerald-100" : "text-sky-700 dark:text-sky-300"}`}>{message.sender_label}</p>
                      {editingMessageId === message.id ? <div className="flex items-center gap-1">
                        <button type="button" onClick={() => { setEditingMessageId(null); setEditingMessageBody(""); setActionMessageId(null); }} className="rounded p-1 hover:bg-black/10" aria-label="Cancelar edición" title="Cancelar"><X size={16} /></button>
                        <button type="button" onClick={() => void saveMessageEdit(message)} disabled={!editingMessageBody.trim()} className="rounded p-1 disabled:opacity-50 hover:bg-black/10" aria-label="Guardar edición" title="Guardar"><Check size={16} /></button>
                      </div> : actionMessageId === message.id && !message.deleted_at && (message.can_edit || message.can_delete) && <div className="flex items-center gap-1">
                        {message.can_edit && <button type="button" onClick={() => { setEditingMessageId(message.id); setEditingMessageBody(message.body ?? ""); }} className="rounded p-1 hover:bg-black/10" aria-label="Editar mensaje" title="Editar durante 15 minutos"><Pencil size={14} /></button>}
                        {message.can_delete && <button type="button" onClick={() => { setMessagePendingDeletion(message); setActionMessageId(null); }} className="rounded p-1 hover:bg-black/10" aria-label="Eliminar mensaje" title="Eliminar mensaje"><Trash2 size={14} /></button>}
                        <button type="button" onClick={() => setActionMessageId(null)} className="rounded p-1 hover:bg-black/10" aria-label="Ocultar acciones" title="Cancelar"><X size={16} /></button>
                      </div>}
                    </div>
                    {editingMessageId === message.id ? <div><textarea autoFocus value={editingMessageBody} onChange={(event) => setEditingMessageBody(event.target.value)} rows={2} className="w-full resize-none rounded-lg border bg-white/90 p-2 text-sm text-slate-900 dark:bg-slate-950 dark:text-slate-100" /></div> : <p className={`whitespace-pre-wrap ${message.deleted_at ? "italic opacity-70" : ""}`}>{message.body}</p>}
                    <p className={`mt-1 text-right text-[11px] ${message.is_mine ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"}`}>{new Date(message.created_at).toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit" })}</p>
                    {message.edited_at && <p className={`text-right text-[11px] ${message.is_mine ? "text-emerald-100/90" : "text-slate-500 dark:text-slate-400"}`}>Editado {formatElapsedTime(message.edited_at)}</p>}
                    {message.deleted_at && message.deleted_by_label && <p className={`text-right text-[11px] ${message.is_mine ? "text-emerald-100/90" : "text-slate-500 dark:text-slate-400"}`}>Eliminado por {message.deleted_by_label}</p>}
                    <p className={`text-right text-[11px] first-letter:uppercase ${message.is_mine ? "text-emerald-100/90" : "text-slate-500 dark:text-slate-400"}`}>{formatElapsedTime(message.created_at)}</p>
                  </div>
                </div>
              ))}
            </section>
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
              disabled={!active}
              value={body}
              rows={1}
              onChange={(event) => {
                setBody(event.target.value);
                event.currentTarget.style.height = "auto";
                event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 128)}px`;
              }}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }}
              placeholder={!active ? "Seleccione una conversación" : "Escribe un mensaje"}
              className="max-h-32 min-h-14 flex-1 resize-none overflow-y-auto rounded-2xl border px-4 py-3 text-base leading-6 dark:bg-slate-950"
            />
            <button onClick={() => void send()} disabled={!body.trim() || !active} className="flex size-14 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white disabled:opacity-50"><Send size={20} /></button>
          </div>
        </footer>
      </main>
    </div>
    <UiMessage
      open={!!messagePendingDeletion}
      title="Eliminar mensaje"
      type="danger"
      confirmText="Eliminar mensaje"
      message={<>¿Deseas eliminar este mensaje? Se conservará en la bitácora de auditoría.</>}
      onClose={() => setMessagePendingDeletion(null)}
      onConfirm={() => { if (messagePendingDeletion) void deleteMessage(messagePendingDeletion); }}
    />
    </>
  );
}






























