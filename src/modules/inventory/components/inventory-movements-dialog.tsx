"use client";

import { useEffect, useMemo, useState } from "react";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { getInventoryMovements } from "../api/get-inventory-movements";

import { InventoryMovement } from "../types/inventory-movement";
import { MRT_Localization_ES } from "material-react-table/locales/es";

type Props = {
  open: boolean;

  inventoryId: string | null;

  onClose: () => void;
};

export function InventoryMovementsDialog({
  open,

  inventoryId,

  onClose,
}: Props) {
  const [data, setData] = useState<InventoryMovement[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !inventoryId) {
      return;
    }

    async function load() {
      try {
        setLoading(true);

        const result = await getInventoryMovements(
          inventoryId ?? "", //revisar esto, no deberia ser null
        );

        setData(result);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open, inventoryId]);

  const columns = useMemo<MRT_ColumnDef<InventoryMovement>[]>(
  () => [

    {
      accessorKey: "created_at",

      header: "Fecha",

      size: 180,

      Cell: ({ cell }) => {

        const date =
          new Date(
            String(
              cell.getValue(),
            ),
          );

        return (

          <div>

            <div>

              {date.toLocaleDateString(
                "es-CR",
              )}

            </div>

            <div
              className="
                text-xs
                text-gray-500
              "
            >

              {date.toLocaleTimeString(
                "es-CR",
                {
                  hour:
                    "2-digit",

                  minute:
                    "2-digit",
                },
              )}

            </div>

          </div>

        );

      },
    },

    {
      id: "movementType",

      header: "Tipo",

      size: 120,

      Cell: ({ row }) => {

        const quantity =
          row.original
            .quantity_change;

        if (
          quantity > 0
        ) {

          return (

            <span
              className="
                inline-flex
                px-2
                py-1
                rounded-full
                bg-green-100
                text-green-700
                text-xs
                font-medium
              "
            >

              Entrada

            </span>

          );

        }

        return (

          <span
            className="
              inline-flex
              px-2
              py-1
              rounded-full
              bg-red-100
              text-red-700
              text-xs
              font-medium
            "
          >

            Salida

          </span>

        );

      },
    },

    {
      accessorKey:
        "quantity_before",

      header:
        "Inicial",

      size: 100,

      Cell: ({ cell }) => (

        <span
          className="
            text-gray-600
            font-medium
          "
        >

          {cell.getValue<number>()}

        </span>

      ),
    },

    {
      accessorKey:
        "quantity_change",

      header:
        "Movimiento",

      size: 120,

      Cell: ({ cell }) => {

        const value =
          Number(
            cell.getValue(),
          );

        return (

          <span
            className={

              value >= 0

                ? `
                    text-green-600
                    font-semibold
                  `

                : `
                    text-red-600
                    font-semibold
                  `

            }
          >

            {value > 0
              ? `+${value}`
              : value}

          </span>

        );

      },
    },

    {
      accessorKey:
        "quantity_after",

      header:
        "Final",

      size: 100,

      Cell: ({ cell }) => (

        <span
          className="
            text-blue-600
            font-semibold
          "
        >

          {cell.getValue<number>()}

        </span>

      ),
    },

    {
      accessorKey:
        "reason",

      header:
        "Motivo",

      size: 220,
    },

    {
      accessorKey:
        "notes",

      header:
        "Notas",

      size: 300,
    },

  ],

  [],
);

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-50
        p-4
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          w-full
          max-w-6xl
          p-5
        "
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="
            flex
            justify-between
            items-center
            mb-4
          "
        >
          <h2
            className="
              text-lg
              font-semibold
            "
          >
            Historial de movimientos
          </h2>

          <button
            onClick={onClose}
            className="
              text-xl
              px-2
            "
          >
            ✕
          </button>
        </div>

        <MaterialReactTable
          columns={columns}
          data={data}
          localization={
                  MRT_Localization_ES
                }
          state={{
            isLoading: loading,
          }}
        />
      </div>
    </div>
  );
}
