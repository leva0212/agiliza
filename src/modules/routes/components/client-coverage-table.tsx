"use client";

import { useMemo } from "react";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { MRT_Localization_ES } from "material-react-table/locales/es";

type CoverageItem = {

  district_id: number;

  canton: string;

  district: string;

  covered_count: number;

  estimated_hours: number | null;
  visit_days: string[];

};

type Props = {
  data: CoverageItem[];

  onViewDistrict: (row: CoverageItem) => void;
};

export function ClientCoverageTable({
  data,

  onViewDistrict,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<CoverageItem>[]>(
    () => [
      {
  accessorKey:
    "visit_days",

  header:
    "Visitas",

  Cell: ({
    row,
  }) => {

    const days =
      row.original
        .visit_days || [];

    const labels = [

      {
        key:
          "sunday",

        label:
          "D",
      },

      {
        key:
          "monday",

        label:
          "L",
      },

      {
        key:
          "tuesday",

        label:
          "M",
      },

      {
        key:
          "wednesday",

        label:
          "M",
      },

      {
        key:
          "thursday",

        label:
          "J",
      },

      {
        key:
          "friday",

        label:
          "V",
      },

      {
        key:
          "saturday",

        label:
          "S",
      },

    ];

    return (

      <div className="flex gap-1">

        {
          labels.map(
            (
              day
            ) => (

              <span

                key={
                  day.key
                }

                className={`
                  text-xs
                  font-bold
                  w-5
                  text-center

                  ${
                    days.includes(
                      day.key
                    )

                      ? "text-green-600"

                      : "text-gray-400"

                  }
                `}
              >

                {
                  day.label
                }

              </span>

            )
          )
        }

      </div>

    );

  },

},
      {
        accessorKey: "canton",

        header: "Cantón",

        GroupedCell: ({ row, cell }) => {
          const hasCoverage = row.subRows?.some(
            (subRow) => subRow.original?.covered_count > 0,
          );

          return (
            <div className="flex items-center gap-2">
              <div
                className={
                  hasCoverage
                    ? "w-3 h-3 rounded-full bg-green-500"
                    : "w-2 h-2 rounded-full bg-red-500"
                }
              />

              <span className="font-semibold">{cell.getValue<string>()}</span>
            </div>
          );
        },
      },

      {
        accessorKey: "district",

        header: "Distrito",

        Cell: ({ row, cell }) => {
          const hasCoverage = row.original.covered_count > 0;

          return (
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                <div
                  className={
                    hasCoverage
                      ? "w-2 h-2 rounded-full bg-green-500"
                      : "w-2 h-2 rounded-full bg-red-500"
                  }
                />

                <span>{cell.getValue<string>()}</span>
              </div>

              <button
                type="button"
                onClick={() => onViewDistrict(row.original)}
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
              >
                Ver barrios
              </button>
            </div>
          );
        },
      },


      {
  accessorKey:
    "estimated_hours",

  header:
    "Entrega",

  Cell: ({
    cell,
  }) => {

    const value =
      cell.getValue<number>();

    if (
      value === 0
    ) {
      return "Cronograma";
    }

    if (
      value == null
    ) {
      return "-";
    }

    return `${value}h`;
  },

}
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      localization={MRT_Localization_ES}
      enableGrouping
      initialState={{
        grouping: ["canton"],

        //expanded: true,
        pagination: {
          pageIndex: 0,

          pageSize: 200,
        },
      }}
      muiSearchTextFieldProps={{
        placeholder: "Buscar distrito...",

        variant: "outlined",

        size: "small",
      }}
      enableSorting={false}
      enableColumnFilters={false}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
      enableColumnActions={false}
      /*
      enableRowActions

      renderRowActions={({

        row,

      }) => {

        if (
          row.getIsGrouped()
        ) {
          return null;
        }

        return (

          <button

            type="button"

            onClick={() =>

              onViewDistrict(
                row.original
              )

            }

            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"

          >

            Ver barrios

          </button>

        );

      }}*/

     /* muiTableBodyRowProps={({ row }) => {
        // solo filas agrupadas (cantones)

        if (!row.getIsGrouped()) {
          return {};
        }

        const hasCoverage = row.subRows?.some(
          (subRow) => subRow.original?.covered_count > 0,
        );

        return {
          sx: {
            backgroundColor: hasCoverage ? "#ecfdf5" : "#fef2f2",

            "& td": {
              fontWeight: 700,

              color: hasCoverage ? "#166534" : "#dc2626",
            },
          },
        };
      }*/

    
    />
  );
}
