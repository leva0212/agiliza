"use client";

import { useMemo } from "react";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import { MRT_Localization_ES } from "material-react-table/locales/es";

type RowItem = {

  covered: string;

  uncovered: string;
};

type Props = {

  open: boolean;

  title: string;

  covered: string[];

  uncovered: string[];

  onClose: () => void;
};

export function CoverageNeighborhoodsDialog({

  open,

  title,

  covered,

  uncovered,

  onClose,

}: Props) {

  if (!open) {
    return null;
  }

  const maxRows =
    Math.max(
      covered.length,
      uncovered.length
    );

  const data =
    Array.from(
      {
        length:
          maxRows,
      },
      (
        _,
        index
      ) => ({

        covered:
          covered[
            index
          ] || "",

        uncovered:
          uncovered[
            index
          ] || "",

      })
    );

  const columns =
    useMemo<
      MRT_ColumnDef<RowItem>[]
    >(
      () => [

        {
          accessorKey:
            "covered",

          header:
            "Con cobertura",

          Cell: ({
            cell,
          }) => (

            <div className="flex items-center gap-2">

              {cell.getValue<string>() && (

                <div className="w-2  h-2 rounded-full bg-green-500" />

              )}

              <span>
                {
                  cell.getValue<string>()
                }
              </span>

            </div>

          ),

          muiTableHeadCellProps: {

            sx: {

              backgroundColor:
                "#ecfdf5",

              color:
                "#15803d",

              fontWeight:
                700,

            },

          },

        },

        {
          accessorKey:
            "uncovered",

          header:
            "Sin cobertura",

          Cell: ({
            cell,
          }) => (

            <div className="flex items-center gap-2">

              {cell.getValue<string>() && (

                <div className="w-2 h-2 rounded-full bg-red-500" />

              )}

              <span>
                {
                  cell.getValue<string>()
                }
              </span>

            </div>

          ),

          muiTableHeadCellProps: {

            sx: {

              backgroundColor:
                "#fef2f2",

              color:
                "#dc2626",

              fontWeight:
                700,

            },

          },

        },

      ],
      []
    );

  return (

    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2">

      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">

        {/* HEADER */}

        <div className="p-4 border-b">

          <h2 className="font-bold text-lg leading-tight break-words">

            {title}

          </h2>

        </div>

        {/* TABLA */}

        <div className="overflow-auto max-h-[70vh]">

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

            enablePagination={
              false
            }

          />

        </div>

        {/* FOOTER */}

        <div className="p-4 border-t flex justify-end">

          <button
            type="button"
            onClick={
              onClose
            }
            className="bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Cerrar
          </button>

        </div>

      </div>

    </div>

  );
}