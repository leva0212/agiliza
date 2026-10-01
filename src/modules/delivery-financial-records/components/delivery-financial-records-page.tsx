"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { History, Pencil, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { standardMrtFeatures } from "@/shared/config/material-react-table";
import { SearchSelector } from "@/shared/components/search-selector";
import Link from "next/link";
import { getCompaniesOptions } from "@/modules/companies/api/get-companies-options";
import { getCouriersOptions } from "@/modules/rates/api/get-couriers-options";
import { getRoutesOptions } from "@/modules/rates/api/get-routes-options";

type RecordType = "company_delivery_charge" | "courier_delivery_payment";
type FinancialRecord = {
  id: string;
  shipment_id: string;
  occurred_at: string;
  tracking_number: string;
  customer_name: string | null;
  company_name: string | null;
  courier_name: string | null;
  route_name: string | null;
  rate_scope: string | null;
  amount: number;
  status: "pending" | "settled" | "voided" | "unrated";
  total_count: number;
  total_amount: number;
};
type FilterKey = "company" | "courier" | "route" | "tracking" | "status" | "from" | "to";
type AmountChange = { previous_amount: number; new_amount: number; justification: string; changed_at: string; changed_by_name: string };

const scopeLabels: Record<string, string> = {
  neighborhood: "Barrio",
  district: "Distrito",
  canton: "Cantón",
  province: "Provincia",
  route: "Ruta",
  default: "Por defecto",
};
const statusLabels: Record<FinancialRecord["status"], string> = {
  pending: "Pendiente",
  settled: "Liquidado",
  voided: "Anulado",
  unrated: "Sin tarifa",
};
const statusColors: Record<FinancialRecord["status"], "warning" | "success" | "default" | "error"> = {
  pending: "warning",
  settled: "success",
  voided: "default",
  unrated: "error",
};
const today = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};
const localBoundary = (date: string, end = false) => new Date(`${date}T${end ? "23:59:59.999" : "00:00:00"}`).toISOString();
const money = new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 });

type Option = { id: string; name: string };
function SearchOptionsDialog({ open, title, options, onClose, onSelect }: { open: boolean; title: string; options: Option[]; onClose: () => void; onSelect: (option: Option) => void }) {
  const [search, setSearch] = useState("");
  useEffect(() => { if (open) setSearch(""); }, [open]);
  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? options.filter((option) => option.name.toLowerCase().includes(term)) : options;
  }, [options, search]);
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{title}</DialogTitle>
    <DialogContent dividers><TextField autoFocus fullWidth label="Buscar" value={search} onChange={(event) => setSearch(event.target.value)} />
      <table className="mt-4 w-full text-left text-sm"><thead><tr className="border-b"><th className="p-2">Nombre</th><th className="p-2 text-right">Acción</th></tr></thead><tbody>{results.map((option) => <tr key={option.id} className="border-b last:border-0"><td className="p-2">{option.name}</td><td className="p-2 text-right"><button type="button" onClick={() => { onSelect(option); onClose(); }} className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">Seleccionar</button></td></tr>)}{results.length === 0 && <tr><td colSpan={2} className="p-5 text-center text-slate-500">No hay resultados.</td></tr>}</tbody></table>
    </DialogContent>
    <DialogActions><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">Cerrar</button></DialogActions>
  </Dialog>;
}

export function DeliveryFinancialRecordsPage({ recordType }: { recordType: RecordType }) {
  const isCompanyCharge = recordType === "company_delivery_charge";
  const heading = isCompanyCharge ? "Cobros a DTS" : "Pagos a mensajeros";
  const description = isCompanyCharge
    ? "Entregas confirmadas que deben cobrarse a cada empresa cliente."
    : "Entregas confirmadas que deben pagarse a los mensajeros de Agiliza.";
  const [data, setData] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [company, setCompany] = useState("");
  const [courier, setCourier] = useState("");
  const [route, setRoute] = useState("");
  const [tracking, setTracking] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [enabled, setEnabled] = useState<Record<FilterKey, boolean>>({
    company: false, courier: false, route: false, tracking: false, status: false, from: true, to: true,
  });
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);
  const [courierPickerOpen, setCourierPickerOpen] = useState(false);
  const [routePickerOpen, setRoutePickerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editJustification, setEditJustification] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [historyRecord, setHistoryRecord] = useState<FinancialRecord | null>(null);
  const [amountChanges, setAmountChanges] = useState<AmountChange[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const { data: companies = [] } = useQuery({ queryKey: ["financial-report-companies"], queryFn: getCompaniesOptions });
  const { data: courierOptions = [] } = useQuery({ queryKey: ["financial-report-couriers"], queryFn: getCouriersOptions });
  const { data: routes = [] } = useQuery({ queryKey: ["financial-report-routes"], queryFn: getRoutesOptions });

  const filters = useMemo(() => ({
    p_record_type: recordType,
    p_company: enabled.company ? company || null : null,
    p_courier: enabled.courier ? courier || null : null,
    p_route: enabled.route ? route || null : null,
    p_tracking_number: enabled.tracking ? tracking || null : null,
    p_status: enabled.status ? status || null : null,
    p_from: enabled.from && from ? localBoundary(from) : null,
    p_to: enabled.to && to ? localBoundary(to, true) : null,
    p_limit: pagination.pageSize,
    p_offset: pagination.pageIndex * pagination.pageSize,
  }), [recordType, company, courier, route, tracking, status, from, to, enabled, pagination]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      try {
        const { data: response, error: queryError } = await createClient().rpc("get_delivery_financial_records_page", filters);
        if (!active) return;
        if (queryError) {
          setError(queryError.message);
          setData([]);
          setTotal(0);
          setTotalAmount(0);
          return;
        }
        const rows = (response ?? []) as FinancialRecord[];
        setData(rows);
        setTotal(Number(rows[0]?.total_count ?? 0));
        setTotalAmount(Number(rows[0]?.total_amount ?? 0));
        setError("");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [filters, refreshToken]);

  const input = "mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950";
  const change = (key: FilterKey, setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(event.target.value);
    setEnabled((current) => ({ ...current, [key]: true }));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };
  const label = (key: FilterKey, text: string) => (
    <Tooltip title={`Marca para activar o desactivar el filtrado por ${text.toLowerCase()}. Al desmarcarlo, se conserva el valor pero se ignora.`}><span className="flex w-fit cursor-help items-center gap-2"><input aria-label={`Activar filtro por ${text.toLowerCase()}`} type="checkbox" checked={enabled[key]} onChange={(event) => {
      setEnabled((current) => ({ ...current, [key]: event.target.checked }));
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }} />{text}</span>
    </Tooltip>
  );
  const reset = () => {
    setCompany(""); setCourier(""); setRoute(""); setTracking(""); setStatus(""); setFrom(today()); setTo(today());
    setEnabled({ company: false, courier: false, route: false, tracking: false, status: false, from: true, to: true });
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };
  const selectFilter = (key: "company" | "courier" | "route", setter: (value: string) => void) => (option: Option) => {
    setter(option.name);
    setEnabled((current) => ({ ...current, [key]: true }));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };
  const openAmountEditor = (record: FinancialRecord) => {
    setEditingRecord(record); setEditAmount(String(record.amount)); setEditJustification(""); setEditError("");
  };
  const openAmountHistory = async (record: FinancialRecord) => {
    setHistoryRecord(record); setAmountChanges([]); setHistoryError(""); setHistoryLoading(true);
    const { data: response, error: queryError } = await createClient().rpc("get_courier_delivery_payment_amount_changes", { p_financial_record_id: record.id });
    if (queryError) setHistoryError(queryError.message);
    else setAmountChanges((response ?? []) as AmountChange[]);
    setHistoryLoading(false);
  };
  const saveAmount = async () => {
    if (!editingRecord) return;
    if (!editJustification.trim()) { setEditError("Debe indicar una justificación."); return; }
    setEditSaving(true); setEditError("");
    const { error: updateError } = await createClient().rpc("update_courier_delivery_payment_amount", {
      p_financial_record_id: editingRecord.id, p_new_amount: Number(editAmount), p_justification: editJustification,
    });
    setEditSaving(false);
    if (updateError) { setEditError(updateError.message); return; }
    setEditingRecord(null); setRefreshToken((value) => value + 1);
  };

  const columns = useMemo<MRT_ColumnDef<FinancialRecord>[]>(() => [
    { accessorKey: "occurred_at", header: "Fecha de entrega", Cell: ({ cell }) => new Date(String(cell.getValue())).toLocaleString("es-CR") },
    { accessorKey: "tracking_number", header: "Guía", Cell: ({ row }) => <Link href={`/dashboard/shipments/${row.original.shipment_id}`} className="font-semibold text-blue-600 underline dark:text-blue-400">{row.original.tracking_number}</Link> },
    { accessorKey: "customer_name", header: "Persona receptora", Cell: ({ cell }) => String(cell.getValue() ?? "Sin nombre") },
    { accessorKey: "company_name", header: "Empresa DTS" },
    { accessorKey: "courier_name", header: "Mensajero" },
    { accessorKey: "route_name", header: "Ruta", Cell: ({ cell }) => String(cell.getValue() ?? "Sin ruta") },
    { accessorKey: "rate_scope", header: "Tarifa aplicada", Cell: ({ cell }) => <Chip size="small" label={scopeLabels[String(cell.getValue() ?? "")] ?? "Sin tarifa"} color={cell.getValue() ? "info" : "error"} /> },
    { accessorKey: "amount", header: isCompanyCharge ? "Cobro" : "Pago", Cell: ({ cell }) => <strong className="text-emerald-600 dark:text-emerald-400">{money.format(Number(cell.getValue()))}</strong> },
    { accessorKey: "status", header: "Estado", Cell: ({ cell }) => <Chip size="small" color={statusColors[cell.getValue() as FinancialRecord["status"]]} label={statusLabels[cell.getValue() as FinancialRecord["status"]]} /> },
    ...(!isCompanyCharge ? [{ id: "actions", header: "Acciones", enableSorting: false, enableColumnFilter: false, Cell: ({ row }: { row: { original: FinancialRecord } }) => <div className="flex items-center gap-1"><Tooltip title="Corregir pago y registrar justificación"><span><IconButton size="small" disabled={row.original.status === "voided"} onClick={() => openAmountEditor(row.original)}><Pencil size={17} /></IconButton></span></Tooltip><Tooltip title="Ver historial de cambios"><IconButton size="small" onClick={() => void openAmountHistory(row.original)}><History size={17} /></IconButton></Tooltip></div> }] : []),
  ], [isCompanyCharge]);

  return <div className="space-y-4 p-2 sm:p-6">
    <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <h2 className="font-semibold">Filtros de {heading.toLowerCase()}</h2>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">{description} Marca el checkbox para aplicar un filtro. Por defecto se muestran las entregas de hoy.</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="text-sm font-medium">{label("company", "Empresa DTS")}<Tooltip title="Abre una lista para elegir la empresa que deseas filtrar."><span><SearchSelector label="" valueName={company} placeholder="Seleccione empresa" onSearch={() => setCompanyPickerOpen(true)} /></span></Tooltip></div>
        <div className="text-sm font-medium">{label("courier", "Mensajero")}<Tooltip title="Abre una lista para elegir el mensajero que deseas filtrar."><span><SearchSelector label="" valueName={courier} placeholder="Seleccione mensajero" onSearch={() => setCourierPickerOpen(true)} /></span></Tooltip></div>
        <div className="text-sm font-medium">{label("route", "Ruta")}<Tooltip title="Abre una lista para elegir la ruta que deseas filtrar."><span><SearchSelector label="" valueName={route} placeholder="Seleccione ruta" onSearch={() => setRoutePickerOpen(true)} /></span></Tooltip></div>
        <label className="text-sm font-medium">{label("tracking", "Número de guía")}<input className={input} value={tracking} onChange={change("tracking", setTracking)} /></label>
        <label className="text-sm font-medium">{label("status", "Estado")}<select className={input} value={status} onChange={change("status", setStatus)}><option value="">Todos los estados</option><option value="pending">Pendiente</option><option value="settled">Liquidado</option><option value="voided">Anulado</option><option value="unrated">Sin tarifa</option></select></label>
        <label className="text-sm font-medium">{label("from", "Fecha desde")}<input className={input} type="date" value={from} onChange={change("from", setFrom)} /></label>
        <label className="text-sm font-medium">{label("to", "Fecha hasta")}<input className={input} type="date" value={to} onChange={change("to", setTo)} /></label>
        <Tooltip title="Restaura los filtros de la pantalla y vuelve a mostrar las entregas de hoy."><button type="button" onClick={reset} className="flex items-center justify-center gap-2 self-end rounded-lg border border-amber-500 bg-amber-50 p-3 font-medium text-amber-800 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-200"><RotateCcw size={17} /> Limpiar filtros</button></Tooltip>
      </div>
    </section>
    {error ? <div className="rounded-xl border border-red-400 p-4 text-red-600">{error}</div> : <>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30"><span>BD · <strong>{total}</strong> registros coincidentes</span><strong>Total: {money.format(totalAmount)}</strong></div>
      <MaterialReactTable {...standardMrtFeatures} columns={columns} data={data} localization={MRT_Localization_ES} manualPagination rowCount={total} state={{ isLoading: loading, pagination }} onPaginationChange={setPagination} initialState={{ density: "compact" }} renderBottomToolbarCustomActions={() => <strong className="px-4 text-emerald-700 dark:text-emerald-300">Total de BD: {money.format(totalAmount)}</strong>} />
    </>}
    <SearchOptionsDialog open={companyPickerOpen} title="Seleccionar empresa DTS" options={companies.map((company) => ({ id: company.id, name: company.name }))} onClose={() => setCompanyPickerOpen(false)} onSelect={selectFilter("company", setCompany)} />
    <SearchOptionsDialog open={courierPickerOpen} title="Seleccionar mensajero" options={courierOptions.map((courier) => ({ id: courier.id, name: courier.full_name }))} onClose={() => setCourierPickerOpen(false)} onSelect={selectFilter("courier", setCourier)} />
    <SearchOptionsDialog open={routePickerOpen} title="Seleccionar ruta" options={routes.map((item) => ({ id: item.id, name: item.name }))} onClose={() => setRoutePickerOpen(false)} onSelect={selectFilter("route", setRoute)} />
    <Dialog open={Boolean(editingRecord)} onClose={() => !editSaving && setEditingRecord(null)} fullWidth maxWidth="xs">
      <DialogTitle>Corregir pago al mensajero</DialogTitle>
      <DialogContent dividers className="space-y-4"><p className="text-sm text-slate-600 dark:text-slate-300">Guía {editingRecord?.tracking_number} · Monto actual: {editingRecord ? money.format(editingRecord.amount) : ""}</p><TextField fullWidth type="number" label="Nuevo monto" value={editAmount} onChange={(event) => setEditAmount(event.target.value)} /><TextField fullWidth required multiline minRows={3} label="Justificación" value={editJustification} onChange={(event) => setEditJustification(event.target.value.slice(0, 500))} helperText="Este cambio quedará registrado con su usuario, fecha y los dos montos." />{editError && <p className="text-sm text-red-600">{editError}</p>}</DialogContent>
      <DialogActions><button type="button" disabled={editSaving} onClick={() => setEditingRecord(null)} className="rounded-lg border px-4 py-2">Cancelar</button><button type="button" disabled={editSaving} onClick={() => void saveAmount()} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{editSaving ? "Guardando..." : "Guardar cambio"}</button></DialogActions>
    </Dialog>
    <Dialog open={Boolean(historyRecord)} onClose={() => setHistoryRecord(null)} fullWidth maxWidth="sm">
      <DialogTitle>Historial de cambios de pago</DialogTitle>
      <DialogContent dividers>{historyRecord && <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Guía {historyRecord.tracking_number} · Pago actual: {money.format(historyRecord.amount)}</p>}{historyLoading && <p className="py-6 text-center text-slate-500">Cargando historial…</p>}{historyError && <p className="text-red-600">{historyError}</p>}{!historyLoading && !historyError && amountChanges.length === 0 && <p className="py-6 text-center text-slate-500">Este pago no ha sido modificado.</p>}<div className="space-y-3">{amountChanges.map((change, index) => <article key={`${change.changed_at}-${index}`} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{money.format(Number(change.previous_amount))} → {money.format(Number(change.new_amount))}</strong><span className="text-xs text-slate-500">{new Date(change.changed_at).toLocaleString("es-CR")}</span></div><p className="mt-2 text-sm">{change.justification}</p><p className="mt-2 text-xs text-slate-500">Modificado por {change.changed_by_name}</p></article>)}</div></DialogContent>
      <DialogActions><button type="button" onClick={() => setHistoryRecord(null)} className="rounded-lg bg-blue-600 px-4 py-2 text-white">Cerrar</button></DialogActions>
    </Dialog>
  </div>;
}
