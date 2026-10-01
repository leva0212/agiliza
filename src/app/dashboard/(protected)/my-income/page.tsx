"use client";

import { useQuery } from "@tanstack/react-query";
import { Banknote, PackageCheck, PiggyBank, ReceiptText, WalletCards } from "lucide-react";
import type { ReactNode } from "react";

import { getMyUnsettledIncomeSummary } from "@/modules/settlements/api/get-my-unsettled-income-summary";

const money = new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });

function SummaryCard({ icon, label, value, detail, tone = "slate" }: { icon: ReactNode; label: string; value: number; detail?: string; tone?: "slate" | "green" | "amber" | "blue" }) {
  const tones = { slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200", green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200", amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200", blue: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200" };
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{money.format(value)}</p>{detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}</div><span className={`rounded-xl p-3 ${tones[tone]}`}>{icon}</span></div></article>;
}

export default function MyIncomePage() {
  const summaryQuery = useQuery({ queryKey: ["my-unsettled-income"], queryFn: getMyUnsettledIncomeSummary, staleTime: 0 });
  const summary = summaryQuery.data;
  const period = summary?.period_starts_at && summary?.period_ends_at
    ? `Período actual: ${new Date(summary.period_starts_at).toLocaleDateString("es-CR", { timeZone: "America/Costa_Rica" })} al ${new Date(summary.period_ends_at).toLocaleDateString("es-CR", { timeZone: "America/Costa_Rica" })}`
    : "Incluye registros pendientes de liquidar.";

  if (summaryQuery.isLoading) return <div className="p-6 text-sm text-slate-500">Cargando tus ingresos…</div>;
  if (summaryQuery.isError) return <div className="mx-auto max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">No tienes permiso para consultar esta información o no fue posible cargarla.</div>;

  return <div className="mx-auto w-full max-w-5xl space-y-4 px-0 py-3 sm:p-6">
    <section className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start gap-3"><span className="rounded-xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-950 dark:text-sky-200"><WalletCards size={24} /></span><div><h2 className="text-xl font-bold">Mis ingresos</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Resumen de entregas e intentos fallidos que aún no han sido liquidados.</p><p className="mt-2 text-xs font-medium text-sky-700 dark:text-sky-300">{period}</p></div></div></section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard icon={<PackageCheck size={22} />} label="Ingresos por operaciones" value={summary?.delivery_income ?? 0} detail={`${summary?.deliveries_count ?? 0} entrega(s) o intento(s) pendiente(s)`} tone="green" />
      <SummaryCard icon={<PiggyBank size={22} />} label="Depósitos recogidos" value={summary?.deposits_collected ?? 0} detail="Dinero recibido por depósitos" tone="amber" />
      <SummaryCard icon={<ReceiptText size={22} />} label="Cobros de envío recogidos" value={summary?.shipping_collected ?? 0} detail="Dinero recibido por costos de envío" tone="amber" />
      <SummaryCard icon={<Banknote size={22} />} label="Total por liquidar" value={summary?.net_amount ?? 0} detail="Operaciones − depósitos − envíos cobrados" tone="blue" />
    </section>
  </div>;
}
