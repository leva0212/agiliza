"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Filter, MapPinned } from "lucide-react";
import { toast } from "sonner";

import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
import { getCantons } from "@/modules/routes/api/get-cantons";
import { getProvinces } from "@/modules/routes/api/get-provinces";
import { setCantonAreaClassification, type CantonAreaClassification } from "@/modules/routes/api/set-canton-area-classification";

const classificationOptions: Array<{ value: Exclude<CantonAreaClassification, null>; label: string }> = [
  { value: "gam", label: "GAM" },
  { value: "rural", label: "Rural" },
];

export default function CantonClassificationPage() {
  const queryClient = useQueryClient();
  const profileQuery = useCurrentProfile();
  const [provinceId, setProvinceId] = useState("");
  const [onlyUnclassified, setOnlyUnclassified] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const isAuthorized = profileQuery.data?.is_owner_company_user === true &&
    (profileQuery.data.role === "super_admin" || profileQuery.data.role === "company_admin");
  const provincesQuery = useQuery({ queryKey: ["provinces"], queryFn: getProvinces });
  const cantonsQuery = useQuery({
    queryKey: ["canton-classification", provinceId],
    queryFn: () => getCantons(Number(provinceId)),
    enabled: Boolean(provinceId) && isAuthorized,
  });
  const cantons = useMemo(() => (cantonsQuery.data ?? []).filter((canton) => !onlyUnclassified || !canton.area_classification), [cantonsQuery.data, onlyUnclassified]);

  async function changeClassification(cantonId: number, value: string) {
    const classification = (value || null) as CantonAreaClassification;
    setSavingId(cantonId);
    try {
      await setCantonAreaClassification(cantonId, classification);
      await queryClient.invalidateQueries({ queryKey: ["canton-classification", provinceId] });
      toast.success(classification ? `Cantón clasificado como ${classification === "gam" ? "GAM" : "Rural"}.` : "Clasificación eliminada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar la clasificación.");
    } finally {
      setSavingId(null);
    }
  }

  if (profileQuery.isLoading) return <div className="p-6 text-sm text-slate-500">Cargando clasificación de cantones…</div>;
  if (!isAuthorized) return <div className="mx-auto max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">Solo personal administrativo y operativo de Agiliza puede clasificar los cantones.</div>;

  const classifiedCount = (cantonsQuery.data ?? []).filter((canton) => canton.area_classification).length;
  return <div className="mx-auto w-full max-w-5xl space-y-4 px-0 py-3 sm:p-6">
    <section className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5"><div className="flex items-start gap-3"><div className="rounded-xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><MapPinned size={22} /></div><div><h1 className="font-semibold">Clasificación de cantones</h1><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Define si cada cantón pertenece a la GAM o a una zona rural. Podrás reutilizar esta clasificación en tarifas, reportes y reglas operativas.</p></div></div></section>
    <section className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><label title="Selecciona la provincia cuyos cantones deseas clasificar." className="grid w-full max-w-md gap-1 text-sm font-medium">Provincia<select title="Selecciona una provincia." value={provinceId} onChange={(event) => setProvinceId(event.target.value)} className="rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950"><option value="">Seleccione una provincia</option>{(provincesQuery.data ?? []).map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}</select></label><label title="Muestra solamente cantones que todavía no tienen clasificación." className="flex cursor-pointer items-center gap-2 text-sm font-medium"><input title="Muestra solamente cantones sin clasificación." type="checkbox" checked={onlyUnclassified} onChange={(event) => setOnlyUnclassified(event.target.checked)} className="size-4 accent-sky-600" /><Filter size={16} /> Sin clasificar</label></div></section>
    {provinceId && <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700"><div><h2 className="font-semibold">Cantones de la provincia</h2><p className="text-sm text-slate-500">{classifiedCount} de {(cantonsQuery.data ?? []).length} clasificados</p></div><span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"><CheckCircle2 size={14} /> Guardado inmediato</span></div>{cantonsQuery.isLoading ? <p className="p-6 text-sm text-slate-500">Cargando cantones…</p> : cantons.length === 0 ? <p className="p-6 text-sm text-slate-500">No hay cantones que coincidan con el filtro.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><tr><th className="px-4 py-3 font-semibold">Cantón</th><th className="px-4 py-3 font-semibold">Clasificación</th></tr></thead><tbody>{cantons.map((canton) => <tr key={canton.id} className="border-t border-slate-200 dark:border-slate-700"><td className="px-4 py-3 font-medium">{canton.name}</td><td className="px-4 py-3"><select title={`Clasifica ${canton.name} como GAM o Rural.`} value={canton.area_classification ?? ""} disabled={savingId === canton.id} onChange={(event) => void changeClassification(canton.id, event.target.value)} className="w-full max-w-xs rounded-xl border border-slate-300 bg-white p-2.5 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"><option value="">Sin clasificar</option>{classificationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td></tr>)}</tbody></table></div>}</section>}
  </div>;
}
