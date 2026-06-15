"use client";

import { useMemo } from "react";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { MRT_Localization_ES } from "material-react-table/locales/es";

import type { RouteOption } from "@/modules/routes/types/route-option";

type Props = {
  data: RouteOption[];

  onDelete: (routeId: string) => void;
};

export function CourierRoutesTable({
  data,

  onDelete,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<RouteOption>[]>(
    () => [
      {
        accessorKey: "name",

        header: "Ruta",

        size: 400,
      },
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      localization={MRT_Localization_ES}
      enableSorting={false}
      enableColumnFilters={false}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
      enableColumnActions={false}
      enableRowActions
      layoutMode="grid"
      displayColumnDefOptions={{
        "mrt-row-actions": {
          size: 150,
          header: "Acciones",
        },
      }}
      muiTablePaperProps={{
        sx: {
          width: "100%",
          maxWidth: "100%",
          boxShadow: "none",
        },
      }}
      muiTableContainerProps={{
        sx: {
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
        },
      }}
      renderRowActions={({ row }) => (
        <button
          type="button"
          onClick={() => onDelete(row.original.id)}
          className="
      bg-red-600
      text-white
      px-3
      py-2
      rounded-lg
      text-sm
    "
        >
          Desvincular
        </button>
      )}
    />
  );
}
/*"use client";

import { useMemo } from "react";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { MRT_Localization_ES } from "material-react-table/locales/es";

import type { RouteOption } from "@/modules/routes/types/route-option";

type Props = {
  data: RouteOption[];

  onDelete: (routeId: string) => void;
};

export function CourierRoutesTable({
  data,

  onDelete,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<RouteOption>[]>(
    () => [
      {
        accessorKey: "name",

        header: "Ruta",

        size: 600,
      },
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      localization={MRT_Localization_ES}
      enableSorting={false}
      enableColumnFilters={false}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
      enableColumnActions={false}
      enableRowActions
      layoutMode="grid"
      muiTablePaperProps={{
        sx: {
          width: "100%",
          maxWidth: "100%",
          boxShadow: "none",
        },
      }}
      muiTableContainerProps={{
        sx: {
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
        },
      }}
      muiTableHeadCellProps={{
        sx: {
          flex: "1 1 auto",
        },
      }}
      muiTableBodyCellProps={{
        sx: {
          flex: "1 1 auto",
        },
      }}
      renderRowActions={({ row }) => (
        <button
          type="button"
          onClick={() => onDelete(row.original.id)}
          className="
            bg-red-600
            text-white
            px-3
            py-2
            rounded-lg
            text-sm
          "
        >
          Eliminar
        </button>
      )}
    />
  );
}*/
