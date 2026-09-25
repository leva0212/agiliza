"use client";

import { ChevronDown, ChevronUp, CircleHelp, Plus, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { getCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
import { getCompaniesOptions } from "@/modules/companies/api/get-companies-options";
import { getCouriersOptions } from "@/modules/couriers/api/get-couriers-options";
import { getRoutesOptions } from "@/modules/routes/api/get-routes-options";
import { getShipments } from "@/modules/shipments/api/get-shipments";
import { ShipmentsTable } from "@/modules/shipments/components/shipments-table";
import { useShipmentsRealtime } from "@/modules/shipments/hooks/use-shipments-realtime";
import { AppBarActionButton, AppBarActionLink, AppBarActions } from "@/shared/components/app-bar-actions";
import { UiMessage } from "@/shared/components/ui-message";

const visitDays = [
  { value: "monday", label: "Lunes" }, { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" }, { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" }, { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

function getParam(params: URLSearchParams, key: string) { return params.get(key) ?? ""; }
function isFilterEnabled(params: URLSearchParams, key: string, value: string) {
  return Boolean(value) && getParam(params, `${key}Enabled`) !== "0";
}

const shipmentFilterStorageKey = "agiliza:shipments-list-filters";
type StoredShipmentFilters = {
  date: string;
  status: string; routeId: string; courierId: string; delivery: string; visitDay: string;
  statusEnabled: boolean; routeEnabled: boolean; courierEnabled: boolean; deliveryEnabled: boolean; visitDayEnabled: boolean;
};
function localDateKey() { return new Date().toLocaleDateString("en-CA"); }
function FilterTitle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-sky-600" />
      {label}
    </label>
  );
}

export default function ShipmentsListPage() {
  useShipmentsRealtime();
  const searchParams = useSearchParams();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = useState(() => getParam(searchParams, "q"));
  const [debouncedSearch, setDebouncedSearch] = useState(() => getParam(searchParams, "q"));
  const [status, setStatus] = useState(() => getParam(searchParams, "status"));
  const [companyId, setCompanyId] = useState(() => getParam(searchParams, "company"));
  const [routeId, setRouteId] = useState(() => getParam(searchParams, "route"));
  const [courierId, setCourierId] = useState(() => getParam(searchParams, "courier"));
  const [delivery, setDelivery] = useState(() => getParam(searchParams, "delivery"));
  const [visitDay, setVisitDay] = useState(() => getParam(searchParams, "day"));
  const [searchEnabled, setSearchEnabled] = useState(() => isFilterEnabled(searchParams, "q", getParam(searchParams, "q")));
  const [statusEnabled, setStatusEnabled] = useState(() => isFilterEnabled(searchParams, "status", getParam(searchParams, "status")));
  const [companyEnabled, setCompanyEnabled] = useState(() => isFilterEnabled(searchParams, "company", getParam(searchParams, "company")));
  const [routeEnabled, setRouteEnabled] = useState(() => isFilterEnabled(searchParams, "route", getParam(searchParams, "route")));
  const [courierEnabled, setCourierEnabled] = useState(() => isFilterEnabled(searchParams, "courier", getParam(searchParams, "courier")));
  const [deliveryEnabled, setDeliveryEnabled] = useState(() => isFilterEnabled(searchParams, "delivery", getParam(searchParams, "delivery")));
  const [visitDayEnabled, setVisitDayEnabled] = useState(() => isFilterEnabled(searchParams, "day", getParam(searchParams, "day")));
  const [advancedOpen, setAdvancedOpen] = useState(() => Boolean(companyId || routeId || courierId || delivery || visitDay));
  const [filtersRestored, setFiltersRestored] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [filtersHelpOpen, setFiltersHelpOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(shipmentFilterStorageKey);
      if (!saved) return;
      const filters = JSON.parse(saved) as StoredShipmentFilters;
      if (filters.date !== localDateKey()) { localStorage.removeItem(shipmentFilterStorageKey); return; }
      setStatus(filters.status); setRouteId(filters.routeId); setCourierId(filters.courierId); setDelivery(filters.delivery); setVisitDay(filters.visitDay);
      setStatusEnabled(filters.statusEnabled); setRouteEnabled(filters.routeEnabled); setCourierEnabled(filters.courierEnabled); setDeliveryEnabled(filters.deliveryEnabled); setVisitDayEnabled(filters.visitDayEnabled);
      setAdvancedOpen(Boolean(filters.routeId || filters.courierId || filters.delivery || filters.visitDay));
    } catch { localStorage.removeItem(shipmentFilterStorageKey); }
    finally { setFiltersRestored(true); }
  }, []);

  useEffect(() => {
    if (!filtersRestored) return;
    const filters: StoredShipmentFilters = { date: localDateKey(), status, routeId, courierId, delivery, visitDay, statusEnabled, routeEnabled, courierEnabled, deliveryEnabled, visitDayEnabled };
    localStorage.setItem(shipmentFilterStorageKey, JSON.stringify(filters));
  }, [filtersRestored, status, routeId, courierId, delivery, visitDay, statusEnabled, routeEnabled, courierEnabled, deliveryEnabled, visitDayEnabled]);
  const profileQuery = useQuery({ queryKey: ["current-profile"], queryFn: getCurrentProfile });
  const companiesQuery = useQuery({ queryKey: ["shipment-filter-companies"], queryFn: getCompaniesOptions, enabled: profileQuery.data?.is_owner_company_user === true });
  const routesQuery = useQuery({ queryKey: ["shipment-filter-routes"], queryFn: getRoutesOptions });
  const couriersQuery = useQuery({ queryKey: ["shipment-filter-couriers"], queryFn: getCouriersOptions, enabled: profileQuery.data?.is_owner_company_user === true });
  const isOwnerCompanyUser = profileQuery.data?.is_owner_company_user === true;

  function replaceUrl(changes: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }
  function resetPage() { setPagination((current) => ({ ...current, pageIndex: 0 })); }
  function toggleFilter(key: string, checked: boolean, setEnabled: (value: boolean) => void) {
    setEnabled(checked); resetPage(); replaceUrl({ [`${key}Enabled`]: checked ? "1" : "0" });
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      replaceUrl({ q: search.trim(), qEnabled: search && searchEnabled ? "1" : "0" });
    }, 400);
    return () => window.clearTimeout(timeout);
  // URL synchronization occurs after the search debounce.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchEnabled]);

  const deliveryHours = useMemo(() => !deliveryEnabled || !delivery ? undefined : delivery === "schedule" ? 0 : Number(delivery), [delivery, deliveryEnabled]);
  const effectiveSearch = searchEnabled ? debouncedSearch.trim() : "";
  const effectiveStatus = statusEnabled ? status : "";
  const effectiveCompanyId = isOwnerCompanyUser && companyEnabled ? companyId : "";
  const effectiveRouteId = routeEnabled ? routeId : "";
  const effectiveCourierId = isOwnerCompanyUser && courierEnabled ? courierId : "";
  const effectiveVisitDay = visitDayEnabled ? visitDay : "";
  const hasAdvancedFilters = Boolean(effectiveCompanyId || effectiveRouteId || effectiveCourierId || deliveryHours !== undefined || effectiveVisitDay);

  const { data, isLoading } = useQuery({
    queryKey: ["shipments", pagination.pageIndex, pagination.pageSize, effectiveSearch, effectiveStatus, effectiveCompanyId, effectiveRouteId, effectiveCourierId, deliveryHours, effectiveVisitDay],
    queryFn: () => getShipments({
      pageIndex: pagination.pageIndex, pageSize: pagination.pageSize,
      status: effectiveStatus || undefined, search: effectiveSearch || undefined,
      companyId: effectiveCompanyId || undefined, routeId: effectiveRouteId || undefined,
      courierId: effectiveCourierId || undefined, deliveryHours, visitDay: effectiveVisitDay || undefined,
    }),
    enabled: filtersRestored && !profileQuery.isLoading,
  });

  function resetAllFilters() {
    setSearch(""); setDebouncedSearch(""); setStatus(""); setCompanyId(""); setRouteId(""); setCourierId(""); setDelivery(""); setVisitDay("");
    setSearchEnabled(false); setStatusEnabled(false); setCompanyEnabled(false); setRouteEnabled(false); setCourierEnabled(false); setDeliveryEnabled(false); setVisitDayEnabled(false);
    localStorage.removeItem(shipmentFilterStorageKey);
    resetPage(); setConfirmResetOpen(false);
    replaceUrl({ q: "", qEnabled: "", status: "", statusEnabled: "", company: "", companyEnabled: "", route: "", routeEnabled: "", courier: "", courierEnabled: "", delivery: "", deliveryEnabled: "", day: "", dayEnabled: "" });
  }
  function disableAdvancedFilters() {
    setCompanyEnabled(false); setRouteEnabled(false); setCourierEnabled(false); setDeliveryEnabled(false); setVisitDayEnabled(false);
    resetPage(); replaceUrl({ companyEnabled: "0", routeEnabled: "0", courierEnabled: "0", deliveryEnabled: "0", dayEnabled: "0" });
  }

  const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950";
  const fieldClass = "space-y-1.5";

  return <div className="mx-auto w-full max-w-[1200px] px-0 py-3 sm:p-6">
    <AppBarActions><AppBarActionButton label="Cómo usar los filtros" onClick={() => setFiltersHelpOpen(true)}><CircleHelp size={19} /></AppBarActionButton><AppBarActionButton label="Limpiar todos los filtros" tone="danger" onClick={() => setConfirmResetOpen(true)}><RotateCcw size={19} /></AppBarActionButton><AppBarActionLink href="/dashboard/shipments" label="Nuevo envío"><Plus size={20} /></AppBarActionLink></AppBarActions>
    <section className="mb-4 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className={`min-w-0 flex-1 ${fieldClass}`}>
          <FilterTitle label="Buscar envíos" checked={searchEnabled} onChange={(checked) => toggleFilter("q", checked, setSearchEnabled)} />
          <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setSearchEnabled(true); resetPage(); }} placeholder="# guía, cliente, teléfono, identificación" className={inputClass} />
        </div>
        <div className={`w-full md:w-56 ${fieldClass}`}>
          <FilterTitle label="Estado" checked={statusEnabled} onChange={(checked) => toggleFilter("status", checked, setStatusEnabled)} />
          <select value={status} onChange={(event) => { const value = event.target.value; setStatus(value); setStatusEnabled(Boolean(value)); resetPage(); replaceUrl({ status: value, statusEnabled: value ? "1" : "0" }); }} className={inputClass}>
            <option value="">Todos los estados</option><option value="created">Creado</option><option value="assigned">Asignado</option><option value="in_route">En ruta</option><option value="delivered">Entregado</option><option value="failed_attempt">Intento fallido</option><option value="rejected">Rechazado</option><option value="cancelled">Cancelado</option>
          </select>
        </div>
        <button type="button" onClick={() => setAdvancedOpen((open) => !open)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sky-300 px-4 text-sm font-semibold text-sky-800 transition hover:bg-sky-50 dark:border-sky-700 dark:text-sky-200 dark:hover:bg-sky-950/50"><SlidersHorizontal size={18} />Más filtros{hasAdvancedFilters ? " (activos)" : ""}{advancedOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>
      </div>
      {advancedOpen && <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {isOwnerCompanyUser && <div className={fieldClass}><FilterTitle label="Empresa" checked={companyEnabled} onChange={(checked) => toggleFilter("company", checked, setCompanyEnabled)} /><select value={companyId} onChange={(event) => { const value = event.target.value; setCompanyId(value); setCompanyEnabled(Boolean(value)); resetPage(); replaceUrl({ company: value, companyEnabled: value ? "1" : "0" }); }} className={inputClass}><option value="">Todas las empresas</option>{(companiesQuery.data ?? []).map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></div>}
          <div className={fieldClass}><FilterTitle label="Ruta" checked={routeEnabled} onChange={(checked) => toggleFilter("route", checked, setRouteEnabled)} /><select value={routeId} onChange={(event) => { const value = event.target.value; setRouteId(value); setRouteEnabled(Boolean(value)); resetPage(); replaceUrl({ route: value, routeEnabled: value ? "1" : "0" }); }} className={inputClass}><option value="">Todas las rutas</option>{(routesQuery.data ?? []).map((route) => <option key={route.id} value={route.id}>{route.name}{route.active ? "" : " (inactiva)"}</option>)}</select></div>
          {isOwnerCompanyUser && <div className={fieldClass}><FilterTitle label="Mensajero" checked={courierEnabled} onChange={(checked) => toggleFilter("courier", checked, setCourierEnabled)} /><select value={courierId} onChange={(event) => { const value = event.target.value; setCourierId(value); setCourierEnabled(Boolean(value)); resetPage(); replaceUrl({ courier: value, courierEnabled: value ? "1" : "0" }); }} className={inputClass}><option value="">Todos los mensajeros</option>{(couriersQuery.data ?? []).map((courier) => <option key={courier.id} value={courier.id}>{courier.name}</option>)}</select></div>}
          <div className={fieldClass}><FilterTitle label="Tiempo de entrega" checked={deliveryEnabled} onChange={(checked) => toggleFilter("delivery", checked, setDeliveryEnabled)} /><select value={delivery} onChange={(event) => { const value = event.target.value; setDelivery(value); setDeliveryEnabled(Boolean(value)); resetPage(); replaceUrl({ delivery: value, deliveryEnabled: value ? "1" : "0" }); }} className={inputClass}><option value="">Cualquier tiempo</option><option value="24">24 horas</option><option value="48">48 horas</option><option value="72">72 horas</option><option value="schedule">Cronograma</option></select></div>
          <div className={fieldClass}><FilterTitle label="Día de visita" checked={visitDayEnabled} onChange={(checked) => toggleFilter("day", checked, setVisitDayEnabled)} /><select value={visitDay} onChange={(event) => { const value = event.target.value; setVisitDay(value); setVisitDayEnabled(Boolean(value)); resetPage(); replaceUrl({ day: value, dayEnabled: value ? "1" : "0" }); }} className={inputClass}><option value="">Cualquier día</option>{visitDays.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</select></div>
        </div>
        {Boolean(companyId || routeId || courierId || delivery || visitDay) && <div className="mt-3 flex justify-end"><button type="button" onClick={disableAdvancedFilters} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"><X size={16} />Desactivar filtros avanzados</button></div>}
      </div>}
    </section>
    {isLoading ? <div className="py-8 text-center text-sm text-slate-500">Cargando envíos...</div> : <ShipmentsTable data={data?.data || []} pagination={pagination} setPagination={setPagination} totalRows={data?.total || 0} />}
    <UiMessage open={confirmResetOpen} type="question" title="¿Limpiar todos los filtros?" message="Se borrarán los valores y las selecciones guardadas para la lista de envíos." cancelText="Cancelar" confirmText="Limpiar filtros" onClose={() => setConfirmResetOpen(false)} onConfirm={resetAllFilters} />
    <UiMessage
      open={filtersHelpOpen}
      type="info"
      title="Cómo usar los filtros"
      message={<div className="space-y-3 text-left leading-relaxed"><p>Marca el checkbox del filtro para aplicarlo a la lista. Al desmarcarlo, su valor se conserva pero se ignora.</p><p>Al elegir un nuevo valor, el checkbox se marca automáticamente. Estado, ruta, mensajero, tiempo y día se recuerdan hasta el cambio de día.</p><p>Empresa y mensajero solo están disponibles para usuarios de la empresa propietaria del sistema.</p><p>Usa el icono de reinicio para borrar todos los filtros guardados.</p></div>}
      closeText="Entendido"
      onClose={() => setFiltersHelpOpen(false)}
    />
  </div>;
}
