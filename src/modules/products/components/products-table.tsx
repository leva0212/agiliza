"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { useRouter } from "next/navigation";

import { standardMrtFeatures } from "@/shared/config/material-react-table";
import type { Product } from "@/modules/products/types/product";

type Props = {
  data: Product[];
  pagination: { pageIndex: number; pageSize: number };
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>;
  totalRows: number;
  onDelete: (product: Product) => void;
};

export function ProductsTable({ data, pagination, setPagination, totalRows, onDelete }: Props) {
  const router = useRouter();
  const columns = useMemo<MRT_ColumnDef<Product>[]>(() => [
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "default_deposit", header: "Depósito sugerido" },
    { accessorKey: "default_shipping_fee", header: "Envío sugerido" },
    { id: "active", header: "Activo", accessorFn: (row) => row.active ? "Sí" : "No" },
  ], []);

  return <MaterialReactTable
    {...standardMrtFeatures}
    columns={columns}
    data={data}
    localization={MRT_Localization_ES}
    manualPagination
    rowCount={totalRows}
    state={{ pagination }}
    onPaginationChange={setPagination}
    muiSearchTextFieldProps={{ placeholder: "Buscar producto...", variant: "outlined", size: "small" }}
    enableRowActions
    positionActionsColumn="last"
    renderRowActions={({ row }) => <div className="flex items-center gap-1">
      <Tooltip title="Editar producto"><IconButton aria-label="Editar producto" size="small" color="primary" onClick={() => router.push(`/dashboard/products/edit/${row.original.id}`)} sx={{ border: "1px solid", borderColor: "primary.main", borderRadius: 1 }}><Pencil size={17} /></IconButton></Tooltip>
      <Tooltip title="Eliminar producto"><IconButton aria-label="Eliminar producto" size="small" color="error" onClick={() => onDelete(row.original)} sx={{ border: "1px solid", borderColor: "error.main", borderRadius: 1 }}><Trash2 size={17} /></IconButton></Tooltip>
    </div>}
  />;
}
