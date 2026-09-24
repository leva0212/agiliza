"use client";

import { Eye } from "lucide-react";
import { useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { standardMrtFeatures } from "@/shared/config/material-react-table";

type CoverageItem = {
  district_id: number;
  province: string;
  canton: string;
  district: string;
  covered_count: number;
  min_hours?: number;
  max_hours?: number;
};

type Props = {
  data: CoverageItem[];
  pagination: { pageIndex: number; pageSize: number };
  setPagination: (updater: { pageIndex: number; pageSize: number } | ((previous: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number })) => void;
  totalRows: number;
  onViewDistrict: (row: CoverageItem) => void;
};

export function CoverageGroupedTable({ data, pagination, setPagination, totalRows, onViewDistrict }: Props) {
  const columns = useMemo<MRT_ColumnDef<CoverageItem>[]>(() => [
    { accessorKey: "province", header: "Provincia" },
    { accessorKey: "canton", header: "Cantón" },
    { accessorKey: "district", header: "Distrito" },
    {
      accessorKey: "min_hours",
      header: "Entrega",
      Cell: ({ row }) => {
        const { min_hours: min = 0, max_hours: max = 0 } = row.original;
        return min === 0 ? "Cronograma" : max > 0 && max !== min ? `${min}–${max} h` : `${min} h`;
      },
    },
    { accessorKey: "covered_count", header: "Barrios" },
  ], []);

  return <MaterialReactTable
    {...standardMrtFeatures}
    columns={columns}
    data={data}
    localization={MRT_Localization_ES}
    muiSearchTextFieldProps={{ placeholder: "Buscar distrito...", variant: "outlined", size: "small" }}
    enablePagination
    manualPagination
    rowCount={totalRows}
    onPaginationChange={setPagination}
    state={{ pagination }}
    enableRowActions
    displayColumnDefOptions={{ "mrt-row-actions": { header: "Acciones", size: 90 } }}
    renderRowActions={({ row }) => <button type="button" onClick={() => onViewDistrict(row.original)} className="inline-flex items-center gap-2 rounded-lg border border-sky-600 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/30"><Eye size={16} />Ver barrios</button>}
  />;
}