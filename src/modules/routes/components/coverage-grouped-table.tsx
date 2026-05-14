"use client";

import { useMemo } from "react";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import { MRT_Localization_ES } from "material-react-table/locales/es";

type CoverageItem = {
  district_id: number;

  province: string;

  canton: string;

  district: string;

  covered_count: number;
};

type Props = {
  data: CoverageItem[];

  pagination: {
    pageIndex: number;

    pageSize: number;
  };

  setPagination: any;

  totalRows: number;

  onViewDistrict: (
    row: CoverageItem,
  ) => void;
};

export function CoverageGroupedTable({

  data,

  pagination,

  setPagination,

  totalRows,

  onViewDistrict,

}: Props) {

  const columns =
    useMemo<
      MRT_ColumnDef<CoverageItem>[]
    >(
      () => [

        {
          accessorKey:
            "province",

          header:
            "Provincia",
        },

        {
          accessorKey:
            "canton",

          header:
            "Cantón",
        },

        {
          accessorKey:
            "district",

          header:
            "Distrito",
        },

        {
          accessorKey:
            "covered_count",

          header:
            "Barrios",
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
        data
      }

      localization={
        MRT_Localization_ES
      }

      muiSearchTextFieldProps={{

        placeholder:
          "Buscar...",

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
        false
      }

      enableFullScreenToggle={
        false
      }

      enableColumnActions={
        false
      }

      enablePagination

      manualPagination

      rowCount={
        totalRows
      }

      onPaginationChange={
        setPagination
      }

      state={{

        pagination,

      }}

      enableRowActions

      renderRowActions={({

        row,

      }) => (

        <button

          type="button"

          onClick={() =>

            onViewDistrict(
              row.original,
            )

          }

          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"

        >

          Ver barrios

        </button>

      )}

    />

  );

}