"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { FileSpreadsheet, Plus, RefreshCw, Search } from "lucide-react";
import Image from "next/image";
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
import { AppBarActionButton, AppBarActions } from "@/shared/components/app-bar-actions";
import { UiMessage } from "@/shared/components/ui-message";
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
  const [commentRecord, setCommentRecord] = useState<TrackingRecord | null>(null);
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
        toast.success("Tracking actualizado");
      } else {
        const companyForCreate = isOwnerCompanyUser
          ? input.company_id
          : profileQuery.data?.company_id ?? "";

        await createTrackingRecord(
          { ...input, company_id: companyForCreate },
          isOwnerCompanyUser,
        );
        toast.success("Tracking creado");
      }

      await queryClient.invalidateQueries({ queryKey: ["tracking-records"] });
      setDialogOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar el tracking");
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



  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl rounded-2xl border border-sky-600 bg-white p-6 text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          Cargando Tracking...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppBarActions>
        <AppBarActionButton
          label="Refrescar datos para obtener la información más reciente"
          onClick={() => { void recordsQuery.refetch(); }}
          disabled={recordsQuery.isFetching}
        >
          <RefreshCw size={19} className={recordsQuery.isFetching ? "animate-spin" : undefined} />
        </AppBarActionButton>
        <AppBarActionButton
          label="Exportar los registros filtrados a Excel"
          tone="success"
          onClick={handleExport}
          disabled={exporting}
        >
          <FileSpreadsheet size={19} />
        </AppBarActionButton>
        <AppBarActionButton
          label="Crear un nuevo registro de tracking"
          tone="primary"
          onClick={() => {
            setSelectedRecord(null);
            setDialogOpen(true);
          }}
        >
          <Plus size={19} />
        </AppBarActionButton>
      </AppBarActions>
      <div className="mx-auto max-w-[1280px] space-y-4 px-3 py-4 sm:px-6 sm:py-6">
        <section className="relative overflow-hidden rounded-2xl border border-sky-600 bg-gradient-to-r from-white to-sky-50 px-4 py-3 shadow-sm dark:from-slate-900 dark:to-blue-950/40">
          <div className="relative flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-sky-200/80 bg-white p-1 shadow-sm dark:border-slate-700">
              <Image src="/images/agiliza-logo-corporate.jpg" alt="Agiliza" width={52} height={52} priority className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">Gestión de entregas</div>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">Consulte, filtre y actualice entregas desde un solo lugar.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-sky-600 bg-white p-4 shadow-sm dark:bg-slate-900 sm:p-5">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Search size={18} className="text-sky-700 dark:text-sky-300" />
                <h2 className="font-semibold">Filtros de búsqueda</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Se muestran los registros de la última semana por defecto.
              </p>
            </div>

          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <label className="grid w-full grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 dark:text-slate-200 sm:block">
              <span className="text-right font-medium sm:text-left">Cliente</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPagination((value) => ({ ...value, pageIndex: 0 }));
                }}
                placeholder="Nombre o cédula"
                className="min-w-0 rounded-xl border border-sky-200 bg-white p-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 sm:mt-1"
              />
            </label>

            <label className="grid w-full grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 dark:text-slate-200 sm:block">
              <span className="text-right font-medium sm:text-left">Desde</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setPagination((value) => ({ ...value, pageIndex: 0 }));
                }}
                className="min-w-0 rounded-xl border border-sky-200 bg-white p-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 sm:mt-1"
              />
            </label>

            <label className="grid w-full grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 dark:text-slate-200 sm:block">
              <span className="text-right font-medium sm:text-left">Hasta</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setPagination((value) => ({ ...value, pageIndex: 0 }));
                }}
                className="min-w-0 rounded-xl border border-sky-200 bg-white p-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 sm:mt-1"
              />
            </label>

            {isOwnerCompanyUser && (
              <label className="grid w-full grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 dark:text-slate-200 sm:block">
                <span className="text-right font-medium sm:text-left">Empresa</span>
                <select
                  value={companyId}
                  onChange={(event) => {
                    setCompanyId(event.target.value);
                    setPagination((value) => ({ ...value, pageIndex: 0 }));
                  }}
                  className="min-w-0 rounded-xl border border-sky-200 bg-white p-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 sm:mt-1"
                >
                  <option value="">Todas las empresas</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.trade_name?.trim() || company.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="grid w-full grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 dark:text-slate-200 sm:block">
              <span className="text-right font-medium sm:text-left">Estatus</span>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPagination((value) => ({ ...value, pageIndex: 0 }));
                }}
                className="min-w-0 rounded-xl border border-sky-200 bg-white p-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 sm:mt-1"
              >
                <option value="">Todos los estados</option>
                {trackingStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid w-full grid-cols-[105px_minmax(0,1fr)] items-center gap-2 text-sm text-slate-700 dark:text-slate-200 sm:block">
              <span className="text-right font-medium sm:text-left">Provincia</span>
              <select
                value={provinceId}
                onChange={(event) => {
                  setProvinceId(event.target.value);
                  setPagination((value) => ({ ...value, pageIndex: 0 }));
                }}
                className="min-w-0 rounded-xl border border-sky-200 bg-white p-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 sm:mt-1"
              >
                <option value="">Todas las provincias</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-sky-600 bg-white shadow-sm dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white px-4 py-3 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                Registros de tracking
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resultados según los filtros seleccionados
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              {recordsQuery.data?.total ?? 0} registros
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            {recordsQuery.isLoading ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Cargando registros...
              </div>
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
                onViewComment={setCommentRecord}
              />
            )}
          </div>
        </section>
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
      <UiMessage
        open={Boolean(commentRecord)}
        type="info"
        title={commentRecord ? `Comentario de ${commentRecord.full_name}` : "Comentario"}
        message={
          <p className="whitespace-pre-wrap break-words text-left">
            {commentRecord?.comment?.trim() || "Sin comentario"}
          </p>
        }
        closeText="OK"
        onClose={() => setCommentRecord(null)}
      />
    </div>
  );
}
