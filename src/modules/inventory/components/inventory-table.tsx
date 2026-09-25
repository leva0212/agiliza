"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";
import Chip from "@mui/material/Chip";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";

import { standardMrtActionColumnSizing, standardMrtFeatures } from "@/shared/config/material-react-table";
import type { Inventory, InventorySummary } from "../types/inventory";

type Props = {
  data: Inventory[];
  pagination: { pageIndex: number; pageSize: number };
  onViewMovements: (inventoryId: string) => void;
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>;
  totalRows: number;
  summary: InventorySummary;
};

export function InventoryTable({ data, pagination, setPagination, totalRows, summary, onViewMovements }: Props) {
  const columns = useMemo<MRT_ColumnDef<Inventory>[]>(
    () => [
      { accessorKey: "courier_name", header: "Mensajero" },
      { accessorKey: "company_name", header: "Empresa" },
      { accessorKey: "product_name", header: "Producto" },
      { accessorKey: "quantity", header: "Cantidad" },
      {
        accessorKey: "stock_status",
        header: "Estado",
        size: 120,
        Cell: ({ row }) => {
          const status = row.original.stock_status ?? (row.original.quantity <= row.original.low_stock ? "low" : row.original.quantity <= row.original.medium_stock ? "medium" : "high");
          if (status === "low") return <Chip label="Bajo" color="error" size="small" />;
          if (status === "medium") return <Chip label="Medio" color="warning" size="small" />;
          return <Chip label="Alto" color="success" size="small" />;
        },
      },
      {
        id: "actions",
        header: "Acciones",
        ...standardMrtActionColumnSizing,
        Cell: ({ row }) => <button type="button" onClick={() => onViewMovements(row.original.id)} className="rounded-lg border px-3 py-1 hover:bg-blue-50 dark:hover:bg-slate-800">📋 Movimientos</button>,
      },
    ],
    [onViewMovements],
  );

  return (
    <MaterialReactTable
      {...standardMrtFeatures}
      columns={columns}
      data={data ?? []}
      localization={MRT_Localization_ES}
      manualPagination
      rowCount={totalRows}
      state={{ pagination }}
      onPaginationChange={setPagination}
      renderBottomToolbarCustomActions={() => (
        <div className="my-2 ml-3 flex items-center gap-3 rounded-xl border border-cyan-400/40 bg-cyan-50 px-4 py-2.5 shadow-sm dark:border-cyan-500/30 dark:bg-cyan-950/35">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-600 text-lg text-white" aria-hidden="true">Σ</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-cyan-800 dark:text-cyan-300">Total de existencias filtradas</p>
            <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{new Intl.NumberFormat("es-CR").format(summary.totalQuantity)} <span className="text-sm font-medium">unidades</span></p>
          </div>
          <span className="border-l border-cyan-300/70 pl-3 text-xs text-slate-600 dark:border-cyan-700 dark:text-slate-300">BD · {new Intl.NumberFormat("es-CR").format(summary.totalRecords)} registros coincidentes</span>
        </div>
      )}
      muiSearchTextFieldProps={{ placeholder: "Buscar inventario...", variant: "outlined", size: "small" }}
      initialState={{ density: "compact" }}
    />
  );
}
