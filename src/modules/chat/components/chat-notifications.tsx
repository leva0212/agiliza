"use client";

import { useEffect, useState } from "react";
import { Bell, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  conversation_id: string;
  subject: string | null;
  tracking_number: string | null;
  company_name: string | null;
  unread_count: number;
  last_message: string;
  last_message_at: string;
};

export function ChatNotifications() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data } = await supabase.rpc("get_unread_chat_notifications");
      setItems((data ?? []) as Notification[]);
    };

    void load();
    const channel = supabase
      .channel("chat-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => void load())
      .subscribe();
    const interval = window.setInterval(load, 30000);

    return () => {
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, []);

  const total = items.reduce((sum, item) => sum + Number(item.unread_count), 0);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" aria-label="Mensajes sin leer" title="Mensajes sin leer">
        <Bell size={20} />
        {total > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">{total > 99 ? "99+" : total}</span>}
      </button>
      {open && (
        <div className="fixed right-3 top-16 z-[100] w-[calc(100vw-1.5rem)] max-w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:right-0 sm:top-12 sm:w-80">
          <div className="border-b p-3 font-semibold dark:border-slate-700">Mensajes sin leer</div>
          {items.length ? items.map((item) => (
            <button key={item.conversation_id} onClick={() => { setOpen(false); router.push(`/dashboard/chat?conversationId=${item.conversation_id}`); }} className="block w-full border-b p-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              <div className="flex items-center justify-between gap-2"><span className="font-medium">{item.tracking_number ? `Envío ${item.tracking_number}` : item.subject ?? "Conversación"}</span><span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{item.unread_count}</span></div>
              <p className="mt-1 text-xs text-slate-500">{item.company_name}</p>
              <p className="truncate text-sm text-slate-600 dark:text-slate-300">{item.last_message}</p>
            </button>
          )) : <div className="p-6 text-center text-sm text-slate-500"><MessageCircle className="mx-auto mb-2" size={22} />No tienes mensajes pendientes.</div>}
        </div>
      )}
    </div>
  );
}
