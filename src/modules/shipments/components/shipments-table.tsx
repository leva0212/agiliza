"use client";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { MRT_Localization_ES } from "material-react-table/locales/es";

import { useMemo } from "react";

import { useRouter } from "next/navigation";
import { getShipmentStatusOption } from "@/modules/shipments/utils/get-shipment-status-option";
import type { PaginationState } from "@tanstack/react-table";
import { Shipment } from "../types/shipment";
import { toast } from "sonner";

type Props = {
  data: Shipment[];

  pagination: PaginationState;

  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;

  totalRows: number;
};

export function ShipmentsTable({
  data,

  pagination,

  setPagination,

  totalRows,
}: Props) {
  const router = useRouter();

  const columns = useMemo<MRT_ColumnDef<Shipment>[]>(
    () => [
      {
        accessorKey: "tracking_number",

        header: "Guía",
        size: 120,      // ancho inicial/establecido
    minSize: 80,    // ancho mínimo (no puede reducirse más)
    maxSize: 300,

        Cell: ({ row }) => {
          const shipment = row.original;

          const status = getShipmentStatusOption(shipment.status);

          const Icon = status?.icon;

          return (
            <div
              className={`
          rounded-lg
          border
          p-2
          flex
          flex-col
          gap-1
          ${status?.className ?? ""}
        `}
            >
              <div
                className="
            flex
            items-center
            justify-between
            gap-2
          "
              >
                <div
                  className="
              font-semibold
            "
                >
                  {shipment.tracking_number}
                </div>

                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();

                    await navigator.clipboard.writeText(
                      shipment.tracking_number,
                    );

                    toast.success("Número de guía copiado");
                  }}
                  className="
              hover:opacity-70
            "
                >
                  📋
                </button>
              </div>

              {status && (
                <div
                  className="
              flex
              items-center
              gap-1
              text-xs
              font-medium
            "
                >
                  {Icon && <Icon size={12} />}

                  {status.label}
                </div>
              )}
            </div>
          );
        },
      },

      {
        accessorFn: (row) => row.company?.name ?? "",

        id: "company",

        header: "Empresa",
        size: 100,      // ancho inicial/establecido
    minSize: 80,    // ancho mínimo (no puede reducirse más)
    maxSize: 300,
      },

      {
        accessorKey: "customer_name",

        header: "Cliente",
      },

      {
        accessorFn: (row) => row.route?.name ?? "",

        id: "route",

        header: "Ruta",
         size: 120,      // ancho inicial/establecido
    minSize: 80,    // ancho mínimo (no puede reducirse más)
    maxSize: 300,
      },

      {
        accessorFn: (row) => row.route?.estimated_hours ?? "",

        id: "estimated_hours",

        header: "Horas",
         size: 80,      // ancho inicial/establecido
    minSize: 80,    // ancho mínimo (no puede reducirse más)
    maxSize: 300,
      },

     /* {
        accessorKey: "status",

        header: "Estado",

        Cell: ({ row }) => {
          const status = getShipmentStatusOption(row.original.status);

          const Icon = status?.icon;

          if (!status) {
            return row.original.status;
          }

          return (
            <div
              className={`
          inline-flex
          items-center
          gap-2
          px-3
          py-1
          rounded-full
          border
          text-xs
          font-medium
          ${status.className}
        `}
            >
              {Icon && <Icon size={14} />}

              {status.label}
            </div>
          );
        },
      },*/

      {
        accessorFn: (row) => new Date(row.created_at).toLocaleString(),

        id: "created_at",

        header: "Creado",
      },
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      localization={MRT_Localization_ES}
      enableColumnFilters={true}
      enableColumnOrdering={true}
      enableSorting={true}
      enableDensityToggle={true}
      enableFullScreenToggle={true}
      enableColumnActions={true}
      enableGlobalFilter={true}
      manualPagination
      rowCount={totalRows}
      state={{
        pagination,
      }}
      initialState={{
        density: "compact", // 👈 opciones: 'compact' | 'comfortable' | 'spacious'
      }}
      onPaginationChange={setPagination}
      muiTableBodyRowProps={({ row }) => ({
        onClick: () => router.push(`/dashboard/shipments/${row.original.id}`),

        sx: {
          cursor: "pointer",
        },
      })}
      muiSearchTextFieldProps={{
        placeholder: "Buscar envío...",

        variant: "outlined",

        size: "small",
      }}
    />
  );
}
