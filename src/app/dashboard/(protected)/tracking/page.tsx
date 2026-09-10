"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import Tooltip from "@mui/material/Tooltip";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
import { getCompanies } from "@/modules/companies/api/get-companies";
import { getProvinces } from "@/modules/routes/api/get-provinces";
import {
  createTrackingRecord,
} from "@/modules/tracking/api/create-tracking-record";
import {
  getTrackingRecords,
} from "@/modules/tracking/api/get-tracking-records";
import {
  exportTrackingRecords,
} from "@/modules/tracking/api/export-tracking-records";
import {
  updateTrackingRecord,
} from "@/modules/tracking/api/update-tracking-record";
import {
  trackingStatusOptions,
} from "@/modules/tracking/constants/tracking-status-options";
import {
  TrackingFormDialog,
} from "@/modules/tracking/components/tracking-form-dialog";
import {
  TrackingHistoryDialog,
} from "@/modules/tracking/components/tracking-history-dialog";
import {
  TrackingTable,
} from "@/modules/tracking/components/tracking-table";
import type {
  TrackingRecord,
  TrackingRecordInput,
} from "@/modules/tracking/types/tracking-record";

function toDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export default function TrackingPage() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return toDateInputValue(date);
  });
  const [endDate, setEndDate] = useState(() => toDateInputValue(new Date()));
  const [companyId, setCompanyId] = useState("");
  const [status, setStatus] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TrackingRecord | null>(null);
  const [historyRecord, setHistoryRecord] = useState<TrackingRecord | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const profileQuery = useQuery({
    queryKey: ["current-profile"],
    queryFn: getCurrentProfile,
  });
  const provincesQuery = useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces,
  });
  const companiesQuery = useQuery({
    queryKey: ["tracking-companies"],
    queryFn: () => getCompanies({ pageIndex: 0, pageSize: 1000 }),
    enabled: profileQuery.data?.is_owner_company_user === true,
  });

  const isOwnerCompanyUser = profileQuery.data?.is_owner_company_user === true;
  const effectiveCompanyId = isOwnerCompanyUser ? companyId : profileQuery.data?.company_id ?? "";

  const recordsQuery = useQuery({
    queryKey: [
      "tracking-records",
      pagination.pageIndex,
      pagination.pageSize,
      startDate,
      endDate,
      effectiveCompanyId,
      status,
      provinceId,
      debouncedSearch,
    ],
    staleTime: 0,
    queryFn: () => getTrackingRecords({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      startDate,
      endDate,
      companyId: effectiveCompanyId || undefined,
      status: status || undefined,
      provinceId: provinceId ? Number(provinceId) : undefined,
      search: debouncedSearch || undefined,
    }),
    enabled: Boolean(profileQuery.data),
  });

  const companies = companiesQuery.data?.data ?? [];
  const provinces = provincesQuery.data ?? [];

  async function handleSave(input: TrackingRecordInput) {
    try {
      if (selectedRecord) {
        await updateTrackingRecord(selectedRecord.id, input, isOwnerCompanyUser);
        toast.success("Seguimiento actualizado");
      } else {
        const companyForCreate = isOwnerCompanyUser
          ? input.company_id
          : profileQuery.data?.company_id ?? "";

        await createTrackingRecord(
          { ...input, company_id: companyForCreate },
          isOwnerCompanyUser,
        );
        toast.success("Seguimiento creado");
      }

      await queryClient.invalidateQueries({ queryKey: ["tracking-records"] });
      setDialogOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar el seguimiento");
      throw error;
    }
  }

  async function handleExport() {
    setExporting(true);

    try {
      const records = await exportTrackingRecords({
        startDate,
        endDate,
        companyId: effectiveCompanyId || undefined,
        status: status || undefined,
        provinceId: provinceId ? Number(provinceId) : undefined,
        search: debouncedSearch || undefined,
      });
      const selectedCompany = companies.find((company) => company.id === effectiveCompanyId);
      const selectedProvince = provinces.find((province) => province.id === Number(provinceId));
      const selectedStatus = trackingStatusOptions.find((option) => option.value === status);
      const { downloadTrackingExcel } = await import(
        "@/modules/tracking/utils/download-tracking-excel"
      );

      await downloadTrackingExcel({
        records,
        includeCompany: isOwnerCompanyUser,
        filters: {
          startDate,
          endDate,
          company: isOwnerCompanyUser
            ? selectedCompany?.trade_name?.trim() || selectedCompany?.name || "Todas las empresas"
            : profileQuery.data?.company?.trade_name?.trim() || profileQuery.data?.company?.name || "Mi empresa",
          status: selectedStatus?.label ?? "Todos los estados",
          province: selectedProvince?.name ?? "Todas las provincias",
          search: debouncedSearch,
        },
      });
      toast.success(`${records.length} registro(s) exportado(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible exportar el reporte");
    } finally {
      setExporting(false);
    }
  }

  const title = useMemo(
    () => isOwnerCompanyUser ? "Seguimiento de empresas" : "Mi seguimiento",
    [isOwnerCompanyUser],
  );

  if (profileQuery.isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="mx-auto max-w-[1280px] p-3 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">Registros de la última semana por defecto.</p>
        </div>
        <div className="flex w-full max-w-[320px] flex-row gap-2 sm:w-auto sm:max-w-none">
          <Tooltip title="Refrescar datos para obtener la información más reciente">
            <button
              type="button"
              aria-label="Refrescar datos"
              onClick={() => {
                void recordsQuery.refetch();
              }}
              disabled={recordsQuery.isFetching}
              className="flex size-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={recordsQuery.isFetching ? "animate-spin" : undefined}
              />
            </button>
          </Tooltip>
          <Tooltip title="Exportar los registros filtrados a Excel">
            <span className="flex-1 sm:flex-none">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="w-full whitespace-nowrap rounded-lg border border-blue-600 px-3 py-2 font-medium text-blue-700 disabled:opacity-50 sm:w-auto sm:px-4"
              >
                {exporting ? "Exportando..." : "Exportar CSV"}
              </button>
            </span>
          </Tooltip>
          <Tooltip title="Crear un nuevo seguimiento">
            <span className="flex-1 sm:flex-none">
              <button
                type="button"
                onClick={() => {
                  setSelectedRecord(null);
                  setDialogOpen(true);
                }}
                className="w-full whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 font-medium text-white sm:w-auto sm:px-4"
              >
                <span className="sm:hidden">Nuevo</span>
                <span className="hidden sm:inline">Nuevo seguimiento</span>
              </button>
            </span>
          </Tooltip>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="grid w-full max-w-[320px] grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 sm:block sm:w-auto">
          <span className="text-right sm:text-left">Buscar cliente</span>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPagination((value) => ({ ...value, pageIndex: 0 }));
            }}
            placeholder="Nombre o cédula"
            className="min-w-0 w-full rounded-lg border p-2 sm:mt-1 sm:block sm:w-52"
          />
        </label>
        <label className="grid w-full max-w-[320px] grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 sm:block sm:w-auto">
          <span className="text-right sm:text-left">Desde</span>
          <input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setPagination((value) => ({ ...value, pageIndex: 0 })); }} className="min-w-0 w-full rounded-lg border p-2 sm:mt-1 sm:block sm:w-auto" />
        </label>
        <label className="grid w-full max-w-[320px] grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 sm:block sm:w-auto">
          <span className="text-right sm:text-left">Hasta</span>
          <input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setPagination((value) => ({ ...value, pageIndex: 0 })); }} className="min-w-0 w-full rounded-lg border p-2 sm:mt-1 sm:block sm:w-auto" />
        </label>
        {isOwnerCompanyUser && (
          <label className="grid w-full max-w-[320px] grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 sm:block sm:w-auto">
            <span className="text-right sm:text-left">Empresa</span>
            <select value={companyId} onChange={(event) => { setCompanyId(event.target.value); setPagination((value) => ({ ...value, pageIndex: 0 })); }} className="min-w-0 w-full rounded-lg border p-2 sm:mt-1 sm:block sm:w-auto">
              <option value="">Todas las empresas</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.trade_name?.trim() || company.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="grid w-full max-w-[320px] grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 sm:block sm:w-auto">
          <span className="text-right sm:text-left">Estatus</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPagination((value) => ({ ...value, pageIndex: 0 })); }} className="min-w-0 w-full rounded-lg border p-2 sm:mt-1 sm:block sm:w-auto">
            <option value="">Todos los estados</option>
            {trackingStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="grid w-full max-w-[320px] grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 sm:block sm:w-auto">
          <span className="text-right sm:text-left">Provincia</span>
          <select value={provinceId} onChange={(event) => { setProvinceId(event.target.value); setPagination((value) => ({ ...value, pageIndex: 0 })); }} className="min-w-0 w-full rounded-lg border p-2 sm:mt-1 sm:block sm:w-auto">
            <option value="">Todas las provincias</option>
            {provinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}
          </select>
        </label>
      </div>

      <div className="w-full overflow-x-auto">
        {recordsQuery.isLoading ? (
          <div>Cargando...</div>
        ) : (
          <TrackingTable
            data={recordsQuery.data?.data ?? []}
            pagination={pagination}
            setPagination={setPagination}
            totalRows={recordsQuery.data?.total ?? 0}
            showCompanyColumn={isOwnerCompanyUser}
            showHistoryAction={isOwnerCompanyUser}
            onEdit={(record) => {
              setSelectedRecord(record);
              setDialogOpen(true);
            }}
            onViewHistory={setHistoryRecord}
          />
        )}
      </div>

      {dialogOpen && (
        <TrackingFormDialog
          open={dialogOpen}
          record={selectedRecord}
          provinces={provinces}
          companies={companies}
          defaultCompanyId={profileQuery.data?.company_id ?? ""}
          canManageStatus={isOwnerCompanyUser}
          onClose={() => {
            setDialogOpen(false);
            setSelectedRecord(null);
          }}
          onSave={handleSave}
        />
      )}

      {isOwnerCompanyUser && (
        <TrackingHistoryDialog
          open={Boolean(historyRecord)}
          record={historyRecord}
          onClose={() => setHistoryRecord(null)}
        />
      )}
    </div>
  );
}
