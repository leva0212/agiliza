"use client";

import { useCallback, useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import { RefreshCw } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { UiMessage } from "@/shared/components/ui-message";

type Counts = { company_records: number; courier_records: number };
type PartyType = "company" | "courier";

export function RecoverUnassignedSettlementRecords({ onRecovered }: { onRecovered?: () => Promise<void> | void }) {
  const [counts, setCounts] = useState<Counts>({ company_records: 0, courier_records: 0 });
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState<PartyType | null>(null);
  const [target, setTarget] = useState<PartyType | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await createClient().rpc("get_unassigned_settlement_financial_records");
    if (error) setError(error.message);
    else {
      const row = (data ?? [])[0] as Counts | undefined;
      setCounts({ company_records: Number(row?.company_records ?? 0), courier_records: Number(row?.courier_records ?? 0) });
      setError("");
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const recover = async () => {
    if (!target) return;
    setRecovering(target);
    setError("");
    const { data, error } = await createClient().rpc("assign_unassigned_financial_records_to_current_period", { p_party_type: target });
    setRecovering(null);
    setTarget(null);
    if (error) { setError(error.message); return; }
    const label = target === "company" ? "DTS" : "mensajeros";
    setSuccess(`Se asignaron ${Number(data ?? 0)} registros de ${label} al período abierto actual.`);
    await load();
    await onRecovered?.();
  };

  const countFor = (party: PartyType) => party === "company" ? counts.company_records : counts.courier_records;
  const labelFor = (party: PartyType) => party === "company" ? "DTS" : "mensajeros";

  return <section className="rounded-xl border border-amber-600/35 bg-amber-950/15 p-4 dark:border-amber-500/30">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-semibold">Registros sin período de liquidación</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">Busca entregas o intentos fallidos que se registraron antes de crear un cronograma. Puedes incorporarlos al período abierto actual; no se asignan a períodos cerrados.</p>
      </div>
      <Tooltip title="Vuelve a consultar en BD cuántos registros siguen sin período de liquidación.">
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-amber-500/60 px-3 py-2 text-sm font-medium hover:bg-amber-500/10 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Buscar sin asignar</button>
      </Tooltip>
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {(["company", "courier"] as PartyType[]).map((party) => <div key={party} className="rounded-lg border border-slate-700/70 bg-slate-950/25 p-3">
        <p className="text-sm text-slate-400">{party === "company" ? "Cobros a DTS" : "Pagos a mensajeros"}</p>
        <strong className="mt-1 block text-2xl">{loading ? "…" : countFor(party)}</strong>
        <Tooltip title={`Asigna los ${countFor(party)} registros sin período al cierre abierto actual de ${labelFor(party)}. Requiere un cronograma activo.`}>
          <span className="mt-3 inline-block"><button type="button" disabled={loading || countFor(party) === 0 || recovering !== null} onClick={() => setTarget(party)} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">Asignar al período actual</button></span>
        </Tooltip>
      </div>)}
    </div>
    {error && <p className="mt-3 rounded-lg border border-red-500/50 bg-red-950/25 p-3 text-sm text-red-300">{error}</p>}
    <UiMessage open={target !== null} type="question" title="¿Asignar registros al período actual?" message={`Los ${target ? countFor(target) : 0} registros de ${target ? labelFor(target) : ""} sin período se incorporarán al cierre abierto actual. No se modificará ningún cierre ya cerrado.`} cancelText="Cancelar" confirmText={recovering ? "Asignando…" : "Asignar registros"} onClose={() => !recovering && setTarget(null)} onConfirm={() => void recover()} />
    <UiMessage open={Boolean(success)} type="success" title="Registros asignados" message={success} confirmText="Aceptar" onClose={() => setSuccess("")} onConfirm={() => setSuccess("")} />
  </section>;
}
