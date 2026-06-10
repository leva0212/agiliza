"use client";

import { useMemo } from "react";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import {
  MRT_Localization_ES,
} from "material-react-table/locales/es";

import type {
  DeliveryRateDetail,
} from "../types/delivery-rate";

type Props = {
  data: DeliveryRateDetail[];
};

function getZoneLabel(
  rate: DeliveryRateDetail,
) {

  if (
    rate.neighborhood
  ) {
    return `Barrio ${rate.neighborhood.name}`;
  }

  if (
    rate.district
  ) {
    return `Distrito ${rate.district.name}`;
  }

  if (
    rate.canton
  ) {
    return `Cantón ${rate.canton.name}`;
  }

  if (
    rate.province
  ) {
    return `Provincia ${rate.province.name}`;
  }

  return "Toda la ruta";

}

export function DeliveryRatesTable({
  data,
}: Props) {

  const columns =
    useMemo<
      MRT_ColumnDef<
        DeliveryRateDetail
      >[]
    >(
      () => [

        {
          id: "zone",

          header: "Zona",

          accessorFn: (
            row,
          ) =>
            getZoneLabel(
              row,
            ),

          size: 250,

          minSize: 150,
        },

        {
          accessorKey:
            "delivery_charge",

          header:
            "Cobro Entrega",

          Cell: ({
            cell,
          }) =>
            `₡${Number(
              cell.getValue(),
            ).toLocaleString()}`,
        },

        {
          accessorKey:
            "failed_charge",

          header:
            "Cobro Fallido",

          Cell: ({
            cell,
          }) =>
            `₡${Number(
              cell.getValue(),
            ).toLocaleString()}`,
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

      enableColumnFilters

      enableColumnOrdering

      enableSorting

      enableDensityToggle

      enableFullScreenToggle

      enableColumnActions

      enableGlobalFilter

      initialState={{

        density:
          "compact",

      }}

      muiSearchTextFieldProps={{

        placeholder:
          "Buscar tarifa...",

        variant:
          "outlined",

        size:
          "small",

      }}

    />

  );

}