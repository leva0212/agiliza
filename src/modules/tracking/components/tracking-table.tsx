"use client";

import { standardMrtFeatures } from "@/shared/config/material-react-table";

import { useMemo } from "react";
import { Copy, Info, Pencil } from "lucide-react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import type { PaginationState } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  trackingStatusOptions,
} from "../constants/tracking-status-options";
import type { TrackingRecord } from "../types/tracking-record";
import { RouteCoverageSummary } from "./route-coverage-summary";

type Props = {
  data: TrackingRecord[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  totalRows: number;
  showHistoryAction: boolean;
  showCompanyColumn: boolean;
  showCreatorCompanyColumn: boolean;
  onEdit: (record: TrackingRecord) => void;
  onViewHistory: (record: TrackingRecord) => void;
  onViewComment: (record: TrackingRecord) => void;
};

export function TrackingTable({
  data,
  pagination,
  setPagination,
  totalRows,
  showHistoryAction,
  showCompanyColumn,
  showCreatorCompanyColumn,
  onEdit,
  onViewHistory,
  onViewComment,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<TrackingRecord>[]>(() => {
    const baseColumns: MRT_ColumnDef<TrackingRecord>[] = [
      {
        id: "actions",
        header: "",
        size: 74,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Editar tracking"
              onClick={() => onEdit(row.original)}
              className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              title="Copiar información"
              onClick={async () => {
                const record = row.original;
                const text = [
                  record.full_name,
                  record.identification,
                  record.province?.name ?? "",
                  record.canton?.name ?? "",
                  record.district?.name ?? "",
                  record.status,
                  record.comment ?? "",
                ].filter(Boolean).join(" | ");

                await navigator.clipboard.writeText(text);
                toast.success("Información copiada");
              }}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Copy size={18} />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Fecha",
        size: 150,
        Cell: ({ cell }) => {
          const date = new Date(cell.getValue<string>());

          return (
            <div className="leading-tight">
              <div>{date.toLocaleDateString("es-CR")}</div>
              <div className="text-xs text-slate-500">
                {date.toLocaleTimeString("es-CR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "full_name",
        header: "Nombre",
        size: 220,
      },
      {
        accessorKey: "identification",
        header: "Cédula",
        size: 175,
        Cell: ({ row }) => <div className="flex items-center gap-1"><span>{row.original.identification}</span><button type="button" title="Copiar cédula" aria-label={`Copiar cédula de ${row.original.full_name}`} onClick={async () => { await navigator.clipboard.writeText(row.original.identification); toast.success("Cédula copiada"); }} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-sky-700 dark:hover:bg-slate-800"><Copy size={15} /></button></div>,
      },
      {
        accessorKey: "status",
        header: "Estatus",
        size: 165,
        Cell: ({ cell }) => {
          const status = trackingStatusOptions.find((option) => option.value === cell.getValue<string>());
          return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${status?.className ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>{status?.label ?? cell.getValue<string>()}</span>;
        },
      },
      {
        accessorKey: "comment",
        header: "Comentario",
        Cell: ({ row }) => {
          const comment = row.original.comment?.trim();
          if (!comment) return "—";
          return <button type="button" title="Clic en esta celda para ver los comentarios" aria-label={`Ver comentario completo de ${row.original.full_name}`} onClick={() => onViewComment(row.original)} className="block w-full truncate rounded-md px-2 py-1 text-left text-sm text-slate-700 hover:bg-sky-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-sky-300">{comment}</button>;
        },
        size: 260,
      },
      {
        id: "route_coverage",
        header: "Cobertura de ruta",
        accessorFn: (row) => row.route_coverage.map((coverage) => coverage.routeName).join(" · "),
        Cell: ({ row }) => <RouteCoverageSummary coverage={row.original.route_coverage} compact />,
        size: 300,
      },
      {
        id: "classification",
        header: "Clasificación",
        accessorFn: (row) => row.canton?.area_classification ?? "",
        Cell: ({ row }) => row.original.canton?.area_classification === "gam" ? "GAM" : row.original.canton?.area_classification === "rural" ? "RURAL" : "Sin clasificar",
        size: 150,
      },
      {
        id: "province",
        header: "Provincia",
        accessorFn: (row) => row.province?.name ?? "",
        size: 160,
      },
      {
        id: "canton",
        header: "Cantón",
        accessorFn: (row) => row.canton?.name ?? "",
        size: 160,
      },
      { id: "district", header: "Distrito", accessorFn: (row) => row.district?.name ?? "", size: 160 },
      ...(showCompanyColumn ? [{
        id: "company",
        header: "Empresa",
        accessorFn: (row: TrackingRecord) => row.company?.display_name ?? [row.company?.code, row.company?.name].filter(Boolean).join(" - ") ?? "Sin empresa",
        size: 190,
      } satisfies MRT_ColumnDef<TrackingRecord>] : []),
      ...(showCreatorCompanyColumn ? [{
        accessorKey: "created_by_company_label",
        header: "Empresa creadora",
        size: 190,
      } satisfies MRT_ColumnDef<TrackingRecord>] : []),
      {
        accessorKey: "created_by_label",
        header: "Creado por",
        size: 180,
      },
    ];

    if (showHistoryAction) {
      baseColumns.push({
        id: "history",
        header: "Historial",
        size: 140,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => (
          <button
            type="button"
            title="Ver historial de cambios"
            aria-label="Ver historial de cambios"
            onClick={() => onViewHistory(row.original)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Info size={18} />
          </button>
        ),
      });
    }

    return baseColumns;
  }, [onEdit, onViewComment, onViewHistory, showCompanyColumn, showCreatorCompanyColumn, showHistoryAction]);

  return (
    <MaterialReactTable
      {...standardMrtFeatures}
      columns={columns}
      data={data}
      localization={MRT_Localization_ES}
      manualPagination
      rowCount={totalRows}
      state={{ pagination }}
      initialState={{ density: "compact" }}
      onPaginationChange={setPagination}
      muiPaginationProps={{
        rowsPerPageOptions: [20, 50, 100],
        showRowsPerPage: true,
      }}
    />
  );
}
