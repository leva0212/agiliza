"use client";

import { useEffect, useState } from "react";
import { Bell, MessageCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ChatNotification = {
  conversation_id: string;
  subject: string | null;
  tracking_number: string | null;
  company_name: string | null;
  unread_count: number;
  last_message: string;
  last_message_at: string;
};

type AccountNotification = { id: string; title: string; body: string; created_at: string };

export function ChatNotifications({ enabled = true, accountEnabled = false }: { enabled?: boolean; accountEnabled?: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<ChatNotification[]>([]);
  const [accountItems, setAccountItems] = useState<AccountNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setOpen(false);
      return;
    }
    const supabase = createClient();
    const load = async () => {
      const { data } = await supabase.rpc("get_unread_chat_notifications");
      setItems((data ?? []) as ChatNotification[]);
    };

    void load();
    window.addEventListener("chat-messages-read", load);
    const channel = supabase
      .channel("chat-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => void load())
      .subscribe();
    const interval = window.setInterval(load, 30000);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("chat-messages-read", load);
      void supabase.removeChannel(channel);
    };
  }, [enabled]);

  useEffect(() => {
    if (!accountEnabled) {
      setAccountItems([]);
      return;
    }
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("user_notifications").select("id,title,body,created_at")
        .eq("recipient_profile_id", user.id).is("read_at", null).order("created_at", { ascending: false }).limit(20);
      setAccountItems((data ?? []) as AccountNotification[]);
    };
    void load();
    const interval = window.setInterval(load, 30_000);
    return () => window.clearInterval(interval);
  }, [accountEnabled]);

  async function markAccountNotificationsRead() {
    if (!accountItems.length) return;
    const supabase = createClient();
    await supabase.from("user_notifications").update({ read_at: new Date().toISOString() }).in("id", accountItems.map((item) => item.id));
    setAccountItems([]);
  }

  const total = items.reduce((sum, item) => sum + Number(item.unread_count), 0) + accountItems.length;

  if (!enabled && !accountEnabled) return null;

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" aria-label="Notificaciones" title="Notificaciones">
        <Bell size={20} />
        {total > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">{total > 99 ? "99+" : total}</span>}
      </button>
      {open && (
        <div className="fixed right-3 top-16 z-[100] max-h-[75dvh] w-[calc(100vw-1.5rem)] max-w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:right-0 sm:top-12 sm:w-80">
          <div className="sticky top-0 z-10 border-b bg-white p-3 font-semibold dark:border-slate-700 dark:bg-slate-900">Notificaciones</div>
          {accountEnabled && accountItems.length > 0 && <section><div className="flex items-center justify-between bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400"><span>Avisos administrativos</span><button type="button" onClick={() => void markAccountNotificationsRead()} className="normal-case tracking-normal text-sky-600 hover:underline dark:text-sky-300">Marcar leídos</button></div>{accountItems.map((item) => <div key={item.id} className="border-b p-3 text-sm dark:border-slate-700"><p className="flex items-center gap-2 font-semibold"><ShieldCheck size={16} className="text-sky-500" />{item.title}</p><p className="mt-1 text-slate-600 dark:text-slate-300">{item.body}</p></div>)}</section>}
          {enabled && items.length > 0 && <div className="bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">Mensajes sin leer</div>}
          {enabled && items.map((item) => (
            <button key={item.conversation_id} onClick={() => { setOpen(false); router.push(`/dashboard/chat?conversationId=${item.conversation_id}`); }} className="block w-full border-b p-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              <div className="flex items-center justify-between gap-2"><span className="font-medium">{item.tracking_number ? `Envío ${item.tracking_number}` : item.subject ?? "Conversación"}</span><span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{item.unread_count}</span></div>
              <p className="mt-1 text-xs text-slate-500">{item.company_name}</p>
              <p className="truncate text-sm text-slate-600 dark:text-slate-300">{item.last_message}</p>
            </button>
          ))}
          {total === 0 && <div className="p-6 text-center text-sm text-slate-500"><MessageCircle className="mx-auto mb-2" size={22} />No tienes notificaciones pendientes.</div>}
        </div>
      )}
    </div>
  );
}


