"use client";

import { useMemo } from "react";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import {
  MRT_Localization_ES,
} from "material-react-table/locales/es";

import type {
  Inventory,
} from "../types/inventory";
import Chip from "@mui/material/Chip";

type Props = {

  data:
    Inventory[];

  pagination: {

    pageIndex:
      number;

    pageSize:
      number;

      

  };

  onViewMovements: (
  inventoryId: string,
) => void;

  setPagination:
    any;

  totalRows:
    number;

};

export function InventoryTable({

  data,

  pagination,

  setPagination,

  totalRows,
  
  onViewMovements,

}: Props) {

  const columns =
    useMemo<
      MRT_ColumnDef<Inventory>[]
    >(
      () => [

        {

          accessorKey:
            "courier_name",

          header:
            "Mensajero",

        },

        {

          accessorKey:
            "company_name",

          header:
            "Empresa",

        },

        {

          accessorKey:
            "product_name",

          header:
            "Producto",

        },

        {

          accessorKey:
            "quantity",

          header:
            "Cantidad",

        },
        {
  accessorKey:
    "stock_status",

  header:
    "Estado",

  size: 120,

  Cell: ({
    row,
  }) => {

    const status =

      row.original
        .stock_status ??

      (
        row.original
          .quantity <=
        row.original
          .low_stock

          ? "low"

          : row.original
              .quantity <=
            row.original
              .medium_stock

          ? "medium"

          : "high"
      );

    if (
      status === "low"
    ) {

      return (

        <Chip
          label="Bajo"
          color="error"
          size="small"
        />

      );

    }

    if (
      status ===
      "medium"
    ) {

      return (

        <Chip
          label="Medio"
          color="warning"
          size="small"
        />

      );

    }

    return (

      <Chip
        label="Alto"
        color="success"
        size="small"
      />

    );

  },
},
{
  id: "actions",

  header: "Acciones",

  size: 140,

  Cell: ({
    row,
  }) => (

    <button

      type="button"

      onClick={() =>
        onViewMovements(
          row.original.id,
        )
      }

      className="
        px-3
        py-1
        rounded-lg
        border
        hover:bg-blue-50
      "

    >

      📋 Movimientos

    </button>

  ),
},

      ],
      [],
    );

  return (

    <MaterialReactTable

      columns={
        columns
      }

      data={
  data ?? []
}

      localization={
        MRT_Localization_ES
      }

      manualPagination

      rowCount={
        totalRows
      }

      state={{
        pagination,
      }}

      onPaginationChange={
        setPagination
      }

      muiSearchTextFieldProps={{

        placeholder:
          "Buscar inventario...",

        variant:
          "outlined",

        size:
          "small",

      }}
        

      enableSorting={
        false
      }

      enableColumnFilters={
        false
      }

      enableDensityToggle={
        true
      }
      initialState={{
    density: 'compact', // 'comfortable' | 'compact' | 'spacious'
  }}

      enableFullScreenToggle={
        false
      }

      enableColumnActions={
        false
      }

    />

  );

}