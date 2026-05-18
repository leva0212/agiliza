"use client";

import { useMemo } from "react";

import { MapPin, Copy } from "lucide-react";

import { toast } from "sonner";

import { LocalidadesService } from "@/services/localidades_service";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { MRT_Localization_ES } from "material-react-table/locales/es";

type LocalidadInfo = {
  nombre: string;
  tipo: string;
  lat: number;
  lng: number;
};

type RowItem = {
  covered: string;

  uncovered: string;
};

type Props = {
  open: boolean;

  title: string;

  province: string;

  canton: string;

  district: string;

  covered: string[];

  uncovered: string[];

  onClose: () => void;
};
/*
function findLocalidad(

  provinceName: string,

  cantonName: string,

  districtName: string,

  neighborhoodName: string,

) {

  const province =

    LocalidadesService.localidadesMap[
      provinceName
    ];

  if (
    !province
  ) {
    return null;
  }

  const canton =

    province[
      cantonName
    ];

  if (
    !canton
  ) {
    return null;
  }

  const district =

    canton[
      districtName
    ];

  if (
    !district
  ) {
    return null;
  }

  return (

    district.find(

      (
        item,
      ) =>

        item.nombre === neighborhoodName,

    ) || null

  );

}*/

function renderLocationCell(
  province: string,

  canton: string,

  district: string,

  name: string,

  colorClass: string,
) {
  if (!name) {
    return null;
  }

  const localidades = LocalidadesService.getLocalidades(
    province,

    canton,

    district,
  );

  const match = localidades.find(
    (item) => item.nombre.toLowerCase() === name.toLowerCase(),
  );

  const category = match?.tipo || "";

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        w-full
      "
    >
      <div
        className="
          flex
          items-start
          gap-2
        "
      >
        <div
          className={`
            w-2
            h-2
            rounded-full
            mt-2
            ${colorClass}
          `}
        />

        <div
          className="
            flex
            flex-col
          "
        >
          <span
            className="
              font-medium
            "
          >
            {name}
          </span>

          <span
            className="
              text-xs
              text-gray-500
            "
          >
            {category}
          </span>
        </div>
      </div>

      <div
        className="
          flex
          gap-2
        "
      >
        <button
          type="button"
          title="Ver ubicación"
          onClick={() => {
            const url = LocalidadesService.getGoogleMapsUrl(
              province,

              canton,

              district,

              name,
            );

            if (!url) {
              toast.error("Ubicación no encontrada");

              return;
            }

            window.open(
              url,

              "_blank",
            );
          }}
        >
          <MapPin size={25} />
        </button>

        <button
          type="button"
          title="Copiar coordenadas"
          onClick={async () => {
            const coords = LocalidadesService.getCoordsLocalidad(
              province,

              canton,

              district,

              name,
            );

            if (!coords) {
              toast.error("Ubicación no encontrada");

              return;
            }

            await navigator.clipboard.writeText(`${coords.lat}, ${coords.lng}`);

            toast.success("Ubicación copiada");
          }}
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
}

export function CoverageNeighborhoodsDialog({
  open,

  title,

  province,

  canton,

  district,

  covered,

  uncovered,

  onClose,
}: Props) {
  if (!open) {
    return null;
  }

  const maxRows = Math.max(covered.length, uncovered.length);

  const data: RowItem[] = Array.from(
    {
      length: maxRows,
    },

    (_, index) => ({
      covered: covered[index] || "",

      uncovered: uncovered[index] || "",
    }),
  );

  const columns = useMemo<MRT_ColumnDef<RowItem>[]>(
    () => [
      {
        accessorKey: "covered",

        header: "Con cobertura",

        Cell: ({ cell }) =>
          renderLocationCell(
            province,

            canton,

            district,

            cell.getValue<string>(),

            "bg-green-500",
          ),

        muiTableHeadCellProps: {
          sx: {
            backgroundColor: "#ecfdf5",

            color: "#15803d",

            fontWeight: 700,
          },
        },
      },

      {
        accessorKey: "uncovered",

        header: "Sin cobertura",

        Cell: ({ cell }) =>
          renderLocationCell(
            province,

            canton,

            district,

            cell.getValue<string>(),

            "bg-red-500",
          ),

        muiTableHeadCellProps: {
          sx: {
            backgroundColor: "#fef2f2",

            color: "#dc2626",

            fontWeight: 700,
          },
        },
      },
    ],

    [],
  );

  return (
    <div
      className="
     
        fixed
        inset-0
        bg-black/50
        z-50
        flex
        items-center
        justify-center
        p-2
      "
    >
      <div
        className="
          bg-white
          rounded-xl
          w-full
            max-w-[500px]
          max-h-[90vh]
          overflow-hidden
        "
      >
        <div
          className="
            p-4
            border-b
          "
        >
          <h2
            className="
              font-bold
              text-lg
              leading-tight
              break-words
            "
          >
            {title}
          </h2>
        </div>

        <div
          className="
            overflow-auto
            max-h-[67vh]
          "
        >
          <MaterialReactTable
            columns={columns}
            data={data}
            localization={MRT_Localization_ES}
            enableSorting={false}
            enableColumnFilters={false}
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableColumnActions={false}
            enablePagination={false}
          />
        </div>

        <div
          className="
            p-4
            border-t
            flex
            justify-end
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              bg-gray-600
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
