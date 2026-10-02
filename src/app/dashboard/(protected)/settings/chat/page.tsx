"use client";

import { MessageCircle, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ChatSettingsPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [initialValue, setInitialValue] = useState(true);
  const [restrictedSupervisorMode, setRestrictedSupervisorMode] = useState(true);
  const [initialRestrictedSupervisorMode, setInitialRestrictedSupervisorMode] = useState(true);
  const [canManageRestrictedMode, setCanManageRestrictedMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/system-settings/chat")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message);
        setEnabled(body.dts_chat_enabled);
        setInitialValue(body.dts_chat_enabled);
        setRestrictedSupervisorMode(body.restricted_supervisor_mode);
        setInitialRestrictedSupervisorMode(body.restricted_supervisor_mode);
        setCanManageRestrictedMode(body.can_manage_restricted_supervisor_mode === true);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "No fue posible cargar la configuración."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/system-settings/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dts_chat_enabled: enabled, restricted_supervisor_mode: restrictedSupervisorMode }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message);
      setInitialValue(enabled);
      setInitialRestrictedSupervisorMode(restrictedSupervisorMode);
      router.refresh();
      toast.success(body.changed ? "Configuración de chat actualizada" : "La configuración no tenía cambios");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar la configuración.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="mx-auto max-w-2xl space-y-4">
    <div><h2 className="text-xl font-bold">Configuración global</h2><p className="text-sm text-slate-500">Controla temporalmente el acceso visible a módulos de SysLogistics.</p></div>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><MessageCircle size={21}/></span><div><h3 className="font-semibold">Chat para empresas DTS</h3><p className="mt-1 text-sm text-slate-500">Al desactivarlo, los usuarios DTS dejan de ver el chat, la campanita y los accesos desde sus envíos. Las conversaciones se conservan. Se habilita al desactivar el modo restringido.</p></div></div>
        <button type="button" role="switch" aria-checked={enabled} disabled={loading || saving || (restrictedSupervisorMode && !canManageRestrictedMode)} onClick={() => setEnabled((value) => !value)} className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${enabled ? "bg-emerald-600" : "bg-slate-400"}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`}/><span className="sr-only">{enabled ? "Desactivar chat para DTS" : "Activar chat para DTS"}</span></button>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"><ShieldCheck size={18} className="shrink-0 text-emerald-600"/>Solo personal administrativo y operativo de EPS puede cambiar estos valores.</div>
      <div className="mt-5 flex items-start justify-between gap-4 border-t border-slate-200 pt-5 dark:border-slate-700">
        <div className="flex min-w-0 gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"><SlidersHorizontal size={21}/></span><div><h3 className="font-semibold">Modo restringido para operativos EPS</h3><p className="mt-1 text-sm text-slate-500">Al activarlo, los operativos de Agiliza solo ven Inicio, Mi seguridad, Tracking y Cobertura, igual que un operativo DTS. Sus permisos actuales para modificar Tracking se mantienen. Solo personal administrativo puede cambiar este valor.</p></div></div>
        <button type="button" role="switch" aria-checked={restrictedSupervisorMode} disabled={loading || saving || !canManageRestrictedMode} onClick={() => setRestrictedSupervisorMode((value) => !value)} className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${restrictedSupervisorMode ? "bg-emerald-600" : "bg-slate-400"}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${restrictedSupervisorMode ? "left-6" : "left-1"}`}/><span className="sr-only">{restrictedSupervisorMode ? "Desactivar modo restringido" : "Activar modo restringido"}</span></button>
      </div>
      <div className="mt-4 flex justify-end"><button type="button" disabled={loading || saving || (enabled === initialValue && restrictedSupervisorMode === initialRestrictedSupervisorMode)} onClick={() => void save()} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar configuración"}</button></div>
    </section>
  </div>;
}
