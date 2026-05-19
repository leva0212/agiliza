"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { LocalidadesService } from "@/services/localidades_service";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import { MRT_Localization_ES } from "material-react-table/locales/es";

import { NavigationDialog } from "@/shared/components/navigation-dialog";

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

type NavigationData = {
  googleMaps: string;
  waze: string;
  coordinates?: string;
};

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

  const [navOpen, setNavOpen] =
    useState(false);

  const [navData, setNavData] =
    useState<NavigationData | null>(
      null
    );

  const maxRows = Math.max(
    covered.length,
    uncovered.length
  );

  const data: RowItem[] =
    Array.from(
      { length: maxRows },
      (_, i) => ({
        covered:
          covered[i] || "",

        uncovered:
          uncovered[i] || "",
      })
    );

  function renderLocationCell(
    name: string,
    colorClass: string,
  ) {

    if (!name)
      return null;

    const localidades =
      LocalidadesService.getLocalidades(
        province,
        canton,
        district
      );

    const match =
      localidades.find(
        (item) =>
          item.nombre.toLowerCase() ===
          name.toLowerCase()
      );

    const category =
      match?.tipo || "";

    return (

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
            mt-1.5
            ${colorClass}
          `}
          />

          <div>

            <div
              className="
              font-medium
              text-sm
            "
            >
              {name}
            </div>

            {category && (

              <div
                className="
                text-xs
                text-gray-500
              "
              >
                {category}
              </div>

            )}

          </div>

        </div>

        <button
          type="button"
          title="Abrir ubicación"
          className="
          p-2
          rounded-lg
          hover:bg-sky-100
          transition-colors
          "
          onClick={() => {

            const urls =
              LocalidadesService.getNavUrls(
                province,
                canton,
                district,
                name
              );

            const coords =
              LocalidadesService.getCoordsLocalidad(
                province,
                canton,
                district,
                name
              );

            if (!urls) {

              toast.error(
                "Ubicación no encontrada"
              );

              return;

            }

            setNavData({

              ...urls,

              coordinates:
                coords
                  ? `${coords.lat}, ${coords.lng}`
                  : undefined,

            });

            setNavOpen(true);

          }}
        >

          <MapPin
            size={30}
            className="
            text-blue-700
          "
          />

        </button>

      </div>

    );

  }

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

          Cell:
            ({
              cell,
            }) =>
              renderLocationCell(
                cell.getValue<string>(),
                "bg-green-500"
              ),

          muiTableHeadCellProps: {

            sx: {

              background:
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

          Cell:
            ({
              cell,
            }) =>
              renderLocationCell(
                cell.getValue<string>(),
                "bg-red-500"
              ),

          muiTableHeadCellProps: {

            sx: {

              background:
                "#fef2f2",

              color:
                "#dc2626",

              fontWeight:
                700,

            },

          },

        },

      ],
      [
        province,
        canton,
        district,
      ]
    );

  if (!open)
    return null;

  return (

    <>

      <div
        className="
        fixed
        inset-0
        bg-blue-950/30
        backdrop-blur-sm
        z-50
        flex
        items-center
        justify-center
        p-3
      "
        onClick={(e) => {

          if (
            e.target ===
            e.currentTarget
          ) {

            onClose();

          }

        }}
      >

        <div
          className="
          bg-gradient-to-b
          from-white
          to-sky-50
          w-full
          max-w-[520px]
          rounded-3xl
          max-h-[90dvh]
          flex
          flex-col
          shadow-2xl
          border
          border-sky-200
        "
        >

          <div
            className="
            px-5
            py-4
            border-b
            border-sky-100
            bg-white/60
            backdrop-blur-sm
            flex
            items-center
            justify-between
          "
          >

            <div>

              <div
                className="
                inline-flex
                items-center
                gap-2
                px-3
                py-1
                rounded-full
                bg-sky-100
                text-sky-700
                text-xs
                font-semibold
                mb-2
              "
              >
                🚚 Cobertura Agiliza
              </div>

              <h2
                className="
                font-bold
                text-lg
                text-blue-900
              "
              >
                {title}
              </h2>

            </div>

            <button
              onClick={onClose}
              className="
              w-8
              h-8
              rounded-full
              hover:bg-sky-100
              text-slate-500
              hover:text-blue-900
            "
            >
              ✕
            </button>

          </div>

          <div
            className="
            overflow-auto
            flex-1
            p-2
          "
          >

            <MaterialReactTable
              columns={columns}
              data={data}
              localization={
                MRT_Localization_ES
              }
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
            px-4
            py-4
            border-t
            flex
            justify-end
          "
          >

            <button
              onClick={onClose}
              className="
              bg-gradient-to-r
              from-blue-900
              to-sky-600
              hover:scale-[1.02]
              transition-all
              text-white
              px-6
              py-2.5
              rounded-2xl
              font-medium
            "
            >
              Cerrar
            </button>

          </div>

        </div>

      </div>

      <NavigationDialog
        open={navOpen}
        googleMaps={
          navData?.googleMaps || ""
        }
        waze={
          navData?.waze || ""
        }
        coordinates={
          navData?.coordinates
        }
        onClose={() =>
          setNavOpen(false)
        }
      />

    </>

  );

}