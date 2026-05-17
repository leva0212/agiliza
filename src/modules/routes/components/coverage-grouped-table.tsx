"use client";

import { useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";

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
  setPagination: any;
  totalRows: number;
  onViewDistrict: (row: CoverageItem) => void;
  onUpdateHours: (districtId: number, minHours: number, maxHours: number) => void;
};

export function CoverageGroupedTable({
  data,
  pagination,
  setPagination,
  totalRows,
  onViewDistrict,
  onUpdateHours,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<CoverageItem>[]>(
    () => [
      {
        accessorKey: "province",
        header: "Provincia",
      },
      {
        accessorKey: "canton",
        header: "Cantón",
      },
      {
        accessorKey: "district",
        header: "Distrito",
      },
      {
        // BUG FIX: accessorKey era "delivery" pero ese campo no existe en CoverageItem.
        // MRT lo usa internamente para acceder al dato; al no existir mostraba undefined
        // y podía romper filtros/sorts aunque estuvieran desactivados.
        // Usamos min_hours como clave real del dato que renderiza esta columna.
        accessorKey: "min_hours",
        header: "Entrega",
        Cell: ({ row }) => {
          const item = row.original;
          const min = item.min_hours ?? 0;
          const max = item.max_hours ?? 0;

          return (
            <div className="flex gap-2">
              <select
                onMouseDown={(e) => e.stopPropagation()}
                value={min}
                className="border rounded px-2 py-1"
                onChange={(e) => {
                  const value = Number(e.target.value);
                  onUpdateHours(item.district_id, value, value === 0 ? 0 : max);
                }}
              >
                <option value={24}>24h</option>
                <option value={48}>48h</option>
                <option value={72}>72h</option>
                <option value={0}>Cronograma</option>
              </select>

              {min !== 0 && (
                <select
                  onMouseDown={(e) => e.stopPropagation()}
                  value={max === 0 ? "" : max}
                  className="border rounded px-2 py-1"
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number(e.target.value);
                    onUpdateHours(item.district_id, min, value);
                  }}
                >
                  <option value="">Igual</option>
                  <option value={24}>24h</option>
                  <option value={48}>48h</option>
                  <option value={72}>72h</option>
                  <option value={96}>96h</option>
                </select>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "covered_count",
        header: "Barrios",
      },
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      localization={MRT_Localization_ES}
      muiSearchTextFieldProps={{
        placeholder: "Buscar...",
        variant: "outlined",
        size: "small",
      }}
      muiTableBodyCellProps={{
        onClick: (e) => e.stopPropagation(),
        sx: { pointerEvents: "auto" },
      }}
      enableSorting={false}
      enableColumnFilters={false}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
      enableColumnActions={false}
      enablePagination
      manualPagination
      rowCount={totalRows}
      onPaginationChange={setPagination}
      state={{ pagination }}
      enableRowActions
      renderRowActions={({ row }) => (
        <button
          type="button"
          onClick={() => onViewDistrict(row.original)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          Ver barrios
        </button>
      )}
    />
  );
}