"use client";

import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

type CoverageDistrict = { district_id: number; province: string; canton: string; district: string };
type Props = { districts: CoverageDistrict[]; onApply: (input: { districtIds: number[]; minHours: number; maxHours: number; days: string[] }) => Promise<void> };
const days = [{ label: "L", value: "monday" }, { label: "M", value: "tuesday" }, { label: "X", value: "wednesday" }, { label: "J", value: "thursday" }, { label: "V", value: "friday" }, { label: "S", value: "saturday" }, { label: "D", value: "sunday" }];

export function BulkRouteScheduleEditor({ districts, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<"all" | "cantons" | "districts">("all");
  const [selectedCantons, setSelectedCantons] = useState<string[]>([]);
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [minHours, setMinHours] = useState(24);
  const [maxHours, setMaxHours] = useState(0);
  const [visitDays, setVisitDays] = useState<string[]>([]);
  const [applying, setApplying] = useState(false);

  const cantonGroups = useMemo(() => Object.entries(districts.reduce<Record<string, CoverageDistrict[]>>((groups, district) => { (groups[district.canton] ||= []).push(district); return groups; }, {})).sort(([a], [b]) => a.localeCompare(b, "es")), [districts]);
  const activeDistricts = scope === "all" ? districts : scope === "cantons" ? districts.filter((district) => selectedCantons.includes(district.canton)) : districts.filter((district) => district.canton === selectedCanton && selectedDistrictIds.includes(district.district_id));

  function toggleCanton(canton: string, ids: number[]) {
    setSelectedCantons((previous) => previous.includes(canton) ? previous.filter((item) => item !== canton) : [...previous, canton]);
    setExpanded((previous) => previous.includes(canton) ? previous : [...previous, canton]);
  }
  function toggleDistrict(id: number) { setSelectedDistrictIds((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]); }
  function toggleDay(day: string) { setVisitDays((previous) => previous.includes(day) ? previous.filter((item) => item !== day) : [...previous, day]); }
  async function submit() { if (!activeDistricts.length) return; setApplying(true); try { await onApply({ districtIds: activeDistricts.map((district) => district.district_id), minHours, maxHours: minHours === 0 ? 0 : maxHours, days: visitDays }); } finally { setApplying(false); } }

  return <section className="rounded-2xl border !border-amber-700 bg-amber-50/40 p-4 dark:!border-amber-600 dark:bg-amber-950/10 sm:p-5">
    <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left"><span><span className="flex items-center gap-2 font-semibold"><SlidersHorizontal size={18} className="text-violet-600 dark:text-violet-300" />Configuración masiva de tiempos y visitas</span><span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">Aplica la misma configuración a varios distritos sin abrirlos uno por uno.</span></span>{open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</button>
    {open && <div className="mt-5 space-y-5 border-t border-violet-200 pt-5 dark:border-violet-900/70">
      <label className="block text-sm font-medium">Aplicar a<select value={scope} onChange={(event) => { setScope(event.target.value as typeof scope); setSelectedCantons([]); setSelectedCanton(""); setSelectedDistrictIds([]); }} className="mt-1.5"><option value="all">Todos los cantones cubiertos</option><option value="cantons">Cantones específicos</option><option value="districts">Distritos específicos de un cantón</option></select></label>
      {scope === "cantons" && <div className="space-y-2 rounded-xl border border-violet-200 bg-white/70 p-3 dark:border-violet-900/70 dark:bg-slate-900/60">{cantonGroups.map(([canton, items]) => { const checked = selectedCantons.includes(canton); const isExpanded = expanded.includes(canton); return <div key={canton} className="rounded-lg border border-slate-200 dark:border-slate-700"><div className="flex items-center gap-2 p-2"><input type="checkbox" checked={checked} onChange={() => toggleCanton(canton, items.map((item) => item.district_id))} /><span className="flex-1 text-sm font-medium">{canton} <span className="font-normal text-slate-500">· {items.length} distritos</span></span><button type="button" aria-label={`Mostrar distritos de ${canton}`} onClick={() => setExpanded((previous) => previous.includes(canton) ? previous.filter((item) => item !== canton) : [...previous, canton])}>{isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}</button></div>{isExpanded && <div className="border-t border-slate-200 px-8 py-2 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{items.map((item) => item.district).join(", ")}</div>}</div>; })}</div>}
      {scope === "districts" && <div className="space-y-3"><label className="block text-sm font-medium">Cantón<select value={selectedCanton} onChange={(event) => { setSelectedCanton(event.target.value); setSelectedDistrictIds([]); }} className="mt-1.5"><option value="">Seleccione cantón</option>{cantonGroups.map(([canton]) => <option key={canton} value={canton}>{canton}</option>)}</select></label>{selectedCanton && <div className="rounded-xl border border-violet-200 bg-white/70 p-3 dark:border-violet-900/70 dark:bg-slate-900/60">{districts.filter((district) => district.canton === selectedCanton).map((district) => <label key={district.district_id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 py-2 last:border-0 dark:border-slate-800"><input type="checkbox" checked={selectedDistrictIds.includes(district.district_id)} onChange={() => toggleDistrict(district.district_id)} /><span className="text-sm">{district.district}</span></label>)}</div>}</div>}
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Tiempo mínimo<select value={minHours} onChange={(event) => { const value = Number(event.target.value); setMinHours(value); if (value === 0) setMaxHours(0); }} className="mt-1.5"><option value={24}>24 horas</option><option value={48}>48 horas</option><option value={72}>72 horas</option><option value={0}>Cronograma</option></select></label>{minHours !== 0 && <label className="text-sm font-medium">Tiempo máximo<select value={maxHours} onChange={(event) => setMaxHours(Number(event.target.value))} className="mt-1.5"><option value={0}>Igual al mínimo</option><option value={24}>24 horas</option><option value={48}>48 horas</option><option value={72}>72 horas</option><option value={96}>96 horas</option></select></label>}</div>
      <div><p className="text-sm font-medium">Días que se visita la zona</p><div className="mt-2 flex gap-2">{days.map((day) => <button key={day.value} type="button" aria-pressed={visitDays.includes(day.value)} onClick={() => toggleDay(day.value)} className={`size-9 rounded-full border text-sm font-semibold ${visitDays.includes(day.value) ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300 dark:border-slate-600"}`}>{day.label}</button>)}</div></div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-violet-100/70 p-3 dark:bg-violet-950/40"><p className="text-sm font-medium">Se modificarán: {activeDistricts.length} {activeDistricts.length === 1 ? "distrito" : "distritos"}</p><button type="button" disabled={applying || activeDistricts.length === 0} onClick={() => void submit()} className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50">{applying ? "Aplicando…" : `Aplicar a ${activeDistricts.length} distritos`}</button></div>
    </div>}
  </section>;
}