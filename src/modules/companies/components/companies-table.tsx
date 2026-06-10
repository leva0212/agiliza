"use client";

import { useMemo } from "react";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { MRT_Localization_ES } from "material-react-table/locales/es";

import { useRouter } from "next/navigation";

import type { Company } from "@/modules/companies/types/company";

type Props = {
  data: Company[];

  pagination: {
    pageIndex: number;

    pageSize: number;
  };

  setPagination: any;

  totalRows: number;
};

export function CompaniesTable({
  data,

  pagination,

  setPagination,

  totalRows,
}: Props) {
  const router = useRouter();

  const columns = useMemo<MRT_ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: "code",

        header: "Código",
      },

      {
        accessorKey: "name",

        header: "Nombre",
      },

      {
        accessorKey: "trade_name",

        header: "Nombre comercial",
      },

      {
        id: "contact",

        header: "Contacto",

        accessorFn: (row) => row.primary_contact?.full_name || "",
      },

      {
        id: "position",

        header: "Cargo",

        accessorFn: (row) => row.primary_contact?.position || "",
      },

      {
        id: "active",

        header: "Activo",

        accessorFn: (row) => (row.active ? "Sí" : "No"),
      },
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      localization={MRT_Localization_ES}
      manualPagination
      rowCount={totalRows}
      state={{
        pagination,
      }}
      onPaginationChange={setPagination}
      muiSearchTextFieldProps={{
        placeholder: "Buscar empresa...",

        variant: "outlined",

        size: "small",
      }}
      enableSorting={false}
      enableColumnFilters={false}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
      enableColumnActions={false}
      enableRowActions
      renderRowActions={({ row }) => (
        <button
          type="button"
          onClick={() =>
            router.push(`/dashboard/companies/?id=${row.original.id}`)
          }
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          Editar
        </button>
      )}
    />
  );
}
