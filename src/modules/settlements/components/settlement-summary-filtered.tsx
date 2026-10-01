"use client";

import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { CircleHelp, RotateCcw } from "lucide-react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { standardMrtFeatures } from "@/shared/config/material-react-table";
import { SearchSelector } from "@/shared/components/search-selector";
import { UiMessage } from "@/shared/components/ui-message";
import { getCompaniesOptions } from "@/modules/companies/api/get-companies-options";
import { getCouriersOptions } from "@/modules/rates/api/get-couriers-options";

type Party = "company" | "courier";
type Option = { id: string; name: string };
type Row = { period_id: string; party_name: string; starts_at: string; ends_at: string; total_entregas: number; total_envios_cobrados: number; total_depositos: number; pagos_extra: number; total_deducciones: number; total_liquidacion: number };
const money = new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 });

function PickerDialog({ open, title, options, onClose, onSelect }: { open: boolean; title: string; options: Option[]; onClose: () => void; onSelect: (option: Option) => void }) {
  const [search, setSearch] = useState("");
  useEffect(() => { if (open) setSearch(""); }, [open]);
  const visible = useMemo(() => { const term = search.trim().toLowerCase(); return term ? options.filter((option) => option.name.toLowerCase().includes(term)) : options; }, [options, search]);
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><DialogTitle>{title}</DialogTitle><DialogContent dividers><TextField autoFocus fullWidth label="Buscar" value={search} onChange={(event) => setSearch(event.target.value)} /><div className="mt-4 space-y-1">{visible.map((option) => <button key={option.id} type="button" onClick={() => { onSelect(option); onClose(); }} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><span>{option.name}</span><span className="text-sm text-sky-600">Seleccionar</span></button>)}{visible.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No hay resultados.</p>}</div></DialogContent><DialogActions><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">Cerrar</button></DialogActions></Dialog>;
}

export function SettlementSummaryFiltered({ party }: { party: Party }) {
  const isCompany = party === "company";
  const filterLabel = isCompany ? "DTS" : "Mensajero";
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: companies = [] } = useQuery({ queryKey: ["settlement-filter-companies"], queryFn: getCompaniesOptions, enabled: isCompany });
  const { data: couriers = [] } = useQuery({ queryKey: ["settlement-filter-couriers"], queryFn: getCouriersOptions, enabled: !isCompany });
  const options: Option[] = isCompany ? companies.map((company) => ({ id: company.id, name: company.name })) : couriers.map((courier) => ({ id: courier.id, name: courier.full_name }));

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      const { data, error } = await createClient().rpc("get_open_settlement_summaries_filtered", { p_party_type: party, p_filter_party_id: filterEnabled ? selected?.id ?? null : null });
      if (!active) return;
      setRows((data ?? []) as Row[]);
      setError(error?.message ?? "");
      setLoading(false);
    })();
    return () => { active = false; };
  }, [party, filterEnabled, selected]);

  const columns: MRT_ColumnDef<Row>[] = [
    { accessorKey: "party_name", header: filterLabel },
    { accessorKey: "total_liquidacion", header: isCompany ? "Total a cobrar" : "Total a pagar", Cell: ({ cell }) => <b>{money.format(Number(cell.getValue()))}</b> },
    { accessorKey: "total_entregas", header: "Entregas e intentos", Cell: ({ cell }) => money.format(Number(cell.getValue())) },
    { accessorKey: "total_envios_cobrados", header: "Envíos cobrados", Cell: ({ cell }) => money.format(Number(cell.getValue())) },
    { accessorKey: "total_depositos", header: "Depósitos", Cell: ({ cell }) => money.format(Number(cell.getValue())) },
    { accessorKey: "pagos_extra", header: "Pago extra", Cell: ({ cell }) => money.format(Number(cell.getValue())) },
    { accessorKey: "total_deducciones", header: "Deducciones", Cell: ({ cell }) => money.format(Number(cell.getValue())) },
  ];
  const select = (option: Option) => { setSelected(option); setFilterEnabled(true); };

  return <div className="space-y-4 p-2 sm:p-6">
    <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <h2 className="font-semibold">Filtros de liquidación</h2>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Consulta el período abierto de todos o de un {filterLabel.toLowerCase()} específico.</p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[280px]">
          <Tooltip title={`Marca para activar o desactivar el filtrado por ${filterLabel.toLowerCase()}. Al desmarcarlo, se conserva la selección pero se muestran todos.`}><label className="mb-1 flex w-fit cursor-help items-center gap-2 text-sm font-medium"><input type="checkbox" checked={filterEnabled} onChange={(event) => setFilterEnabled(event.target.checked)} /> {filterLabel}</label></Tooltip>
          <Tooltip title={`Abre una lista para seleccionar el ${filterLabel.toLowerCase()} que deseas consultar.`}><span><SearchSelector label="" valueName={selected?.name ?? ""} placeholder={`Seleccione ${filterLabel.toLowerCase()}`} onSearch={() => setPickerOpen(true)} /></span></Tooltip>
        </div>
        <Tooltip title="Desactiva el filtro y borra la selección actual."><button type="button" onClick={() => { setSelected(null); setFilterEnabled(false); }} className="inline-flex h-12 items-center gap-2 rounded-lg border border-amber-500 px-3 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/30"><RotateCcw size={16} /> Limpiar filtro</button></Tooltip>
      </div>
    </section>
    <section className="rounded-xl border border-sky-700/40 bg-sky-950/30 p-3 text-sm"><div className="flex items-center gap-1"><strong>Resumen del período abierto</strong><Tooltip title="Explica cómo se calculan los totales de liquidación."><IconButton size="small" onClick={() => setHelpOpen(true)}><CircleHelp size={17} /></IconButton></Tooltip></div><p className="mt-1">Los totales se calculan en BD sobre todos los ítems incluidos.</p></section>
    {error ? <p className="text-red-600">{error}</p> : <MaterialReactTable {...standardMrtFeatures} columns={columns} data={rows} state={{ isLoading: loading }} localization={MRT_Localization_ES} />}
    <PickerDialog open={pickerOpen} title={`Seleccionar ${filterLabel}`} options={options} onClose={() => setPickerOpen(false)} onSelect={select} />
    <UiMessage open={helpOpen} type="info" title="Cómo se calcula este total" message={<div className="space-y-2 text-left"><p><strong>{isCompany ? "Total a cobrar" : "Total a pagar"}:</strong> tarifas de entregas e intentos fallidos, menos el dinero efectivamente recolectado por envíos y depósitos, más pagos extra y menos deducciones.</p><p>Los depósitos y cobros de envío se toman del monto realmente registrado al confirmar una entrega; los intentos fallidos no agregan dinero recolectado.</p><p>La selección filtra exclusivamente períodos abiertos de {isCompany ? "ese DTS" : "ese mensajero"}.</p></div>} onClose={() => setHelpOpen(false)} />
  </div>;
}
