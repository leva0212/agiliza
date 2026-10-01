"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Notification = { id: string; title: string; body: string; created_at: string };

export function AccountNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("user_notifications").select("id,title,body,created_at")
      .eq("recipient_profile_id", user.id).is("read_at", null).order("created_at", { ascending: false }).limit(20);
    setItems((data ?? []) as Notification[]);
  }
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 30_000); return () => window.clearInterval(timer); }, []);
  async function markRead() {
    const supabase = createClient();
    if (items.length) await supabase.from("user_notifications").update({ read_at: new Date().toISOString() }).in("id", items.map((item) => item.id));
    setItems([]); setOpen(false);
  }
  return <div className="relative"><button type="button" title="Notificaciones de cuenta" onClick={() => setOpen((value) => !value)} className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Bell size={20} />{items.length > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-xs font-bold text-white">{items.length}</span>}</button>{open && <div className="absolute right-0 top-12 z-[100] w-80 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl"><div className="mb-2 flex items-center justify-between"><strong>Notificaciones</strong>{items.length > 0 && <button onClick={() => void markRead()} className="text-xs text-sky-300">Marcar leídas</button>}</div>{items.length ? items.map((item) => <div key={item.id} className="border-t border-slate-700 py-2 text-sm"><p className="font-semibold">{item.title}</p><p className="text-slate-300">{item.body}</p></div>) : <p className="text-sm text-slate-400">No tienes notificaciones pendientes.</p>}</div>}</div>;
}
