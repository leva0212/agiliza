"use client";

import { useMemo } from "react";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { MRT_Localization_ES } from "material-react-table/locales/es";

import EditIcon from "@mui/icons-material/Edit";

import DeleteIcon from "@mui/icons-material/Delete";

import IconButton from "@mui/material/IconButton";

import Tooltip from "@mui/material/Tooltip";

type Props = {
  data: any[];

  onEdit: (rate: any) => void;

  onDelete: (rateId: string) => void;
};

function getZoneLabel(rate: any) {
  if (rate.neighborhood) {
    return `Barrio ${rate.neighborhood.name}`;
  }

  if (rate.district) {
    return `Distrito ${rate.district.name}`;
  }

  if (rate.canton) {
    return `Cantón ${rate.canton.name}`;
  }

  if (rate.province) {
    return `Provincia ${rate.province.name}`;
  }

  return "Toda la ruta";
}

export function CourierDeliveryRatesTable({
  data,

  onEdit,

  onDelete,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        id: "courier",

        header: "Mensajero",

        accessorFn: (row) => row.courier?.profile?.full_name ?? "",
      },

      {
        id: "zone",

        header: "Zona",

        Cell: ({ row }) => {
          const rate = row.original;

          const zone = getZoneLabel(rate);

          const showRoute = zone === "Toda la ruta";

          return (
            <div>
              <div>{zone}</div>

              {showRoute && (
                <div
                  className="
                        text-xs
                        text-gray-500
                      "
                >
                  {rate.route?.name}
                </div>
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "delivery_pay",

        header: "Pago Entrega",

        Cell: ({ cell }) => `₡${Number(cell.getValue()).toLocaleString()}`,
      },

      {
        accessorKey: "failed_pay",

        header: "Pago Intento Fallido",

        Cell: ({ cell }) => `₡${Number(cell.getValue()).toLocaleString()}`,
      },

      {
        id: "actions",

        header: "Acciones",

        enableSorting: false,

        enableColumnFilter: false,

        Cell: ({ row }) => (
          <div
            className="
                  flex
                  items-center
                  gap-1
                "
          >
            <Tooltip
              title="
                    Modificar tarifa mensajero
                  "
            >
              <IconButton size="small" onClick={() => onEdit(row.original)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip
              title="
                    Eliminar tarifa mensajero
                  "
            >
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(row.original.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        ),
      },
    ],

    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      localization={MRT_Localization_ES}
      enableColumnFilters
      enableColumnOrdering
      enableSorting
      enableDensityToggle
      enableFullScreenToggle
      enableColumnActions
      enableGlobalFilter
      initialState={{
        density: "compact",
      }}
      muiSearchTextFieldProps={{
        placeholder: "Buscar tarifa...",

        variant: "outlined",

        size: "small",
      }}
    />
  );
}
