"use client";

import { useMemo } from "react";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import { MRT_Localization_ES }
from "material-react-table/locales/es";

import { useRouter }
from "next/navigation";

import type { Product }
from "@/modules/products/types/product";

type Props = {
  data: Product[];

  pagination: {
    pageIndex: number;

    pageSize: number;
  };

  setPagination: any;

  totalRows: number;
};

export function ProductsTable({
  data,

  pagination,

  setPagination,

  totalRows,
}: Props) {

  const router =
    useRouter();

  const columns =
    useMemo<
      MRT_ColumnDef<Product>[]
    >(
      () => [

        {
          accessorKey: "sku",

          header: "SKU",
        },

        {
          accessorKey: "name",

          header: "Nombre",
        },

        {
          accessorKey:
            "default_deposit",

          header:
            "Depósito sugerido",
        },

        {
          accessorKey:
            "default_shipping_fee",

          header:
            "Envío sugerido",
        },

        {
          id: "active",

          header: "Activo",

          accessorFn:
            (row) =>

              row.active
                ? "Sí"
                : "No",
        },

      ],
      [],
    );

  return (

    <MaterialReactTable
      columns={columns}
      data={data}
      localization={
        MRT_Localization_ES
      }
      manualPagination
      rowCount={totalRows}
      state={{
        pagination,
      }}
      onPaginationChange={
        setPagination
      }
      muiSearchTextFieldProps={{
        placeholder:
          "Buscar producto...",

        variant:
          "outlined",

        size:
          "small",
      }}
      enableSorting={false}
      enableColumnFilters={false}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
      enableColumnActions={false}
      enableRowActions
      renderRowActions={({
        row,
      }) => (

        <button
          type="button"
          onClick={() =>
            router.push(
              `/dashboard/products/edit/${row.original.id}`,
            )
          }
          className="
            bg-blue-600
            text-white
            px-3
            py-2
            rounded-lg
            text-sm
          "
        >
          Editar
        </button>

      )}
    />

  );

}