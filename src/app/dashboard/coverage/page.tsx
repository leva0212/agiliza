"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BarriosService,
} from "@/barrios.service";

import {
  getProvinceCoverageCounts,
} from "@/modules/routes/api/get-province-coverage-counts";

import {
  getDistrictNeighborhoods,
} from "@/modules/routes/api/get-district-neighborhoods";

import {
  ClientCoverageTable,
} from "@/modules/routes/components/client-coverage-table";

import {
  CoverageNeighborhoodsDialog,
} from "@/modules/routes/components/coverage-neighborhoods-dialog";

import Image from "next/image";
import { AppVersion } from "@/shared/components/app-version";

type CoverageRow = {

  district_id: number;

  canton: string;

  district: string;

  covered_count: number;

  estimated_hours: number | null;

  visit_days: string[];

};

export default function CoveragePage() {

  const provinces =
    BarriosService.provinciasLista;

  const [
    selectedProvince,
    setSelectedProvince,
  ] = useState("");

  const [
    coverageData,
    setCoverageData,
  ] = useState<
    CoverageRow[]
  >([]);

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(
    false
  );

  const [
    dialogTitle,
    setDialogTitle,
  ] = useState(
    ""
  );

  const [
    coveredNeighborhoods,
    setCoveredNeighborhoods,
  ] = useState<
    string[]
  >(
    []
  );

  const [
    uncoveredNeighborhoods,
    setUncoveredNeighborhoods,
  ] = useState<
    string[]
  >(
    []
  );

  async function loadCoverage(
  provinceName: string
) {

  try {

    const provinceMap =
      BarriosService
        .barriosMap[
          provinceName
        ];

    if (
      !provinceMap
    ) {

      setCoverageData(
        []
      );

      return;

    }

    let districtIndex =
      1;

    const localDistricts:
      CoverageRow[] = [];

    Object.entries(
      provinceMap
    ).forEach(
      ([
        cantonName,
        districtsMap,
      ]) => {

        Object.keys(
          districtsMap
        ).forEach(
          (
            districtName
          ) => {

            localDistricts.push({

              // temporal
              district_id:
                districtIndex,

              canton:
                cantonName,

              district:
                districtName,

              covered_count:
                0,

              estimated_hours:
                null,

              visit_days:
                [],

            });

            districtIndex++;

          }
        );

      }
    );

    const counts =
      await getProvinceCoverageCounts(
        provinceName
      );

    const merged =
      localDistricts.map(
        (
          district
        ) => {

          const match =
            counts.find(
              (
                item: any
              ) =>

                item.canton ===
                  district.canton

                &&

                item.district ===
                  district.district

            );

          return {

  ...district,

  district_id:
    match?.district_id
    ||
    district.district_id,

  covered_count:
    Number(
      match?.covered_count || 0
    ),

  estimated_hours:
    match?.estimated_hours
    ?? null,

  visit_days:
    match?.visit_days
    || [],

};

        }
      );

    setCoverageData(
      merged
    );

  } catch (
    error
  ) {

    console.error(
      error
    );

  }

}
/*
  async function loadCoverage(
    provinceName: string
  ) {

    try {

      const provinceMap =
        BarriosService
          .barriosMap[
            provinceName
          ];

      if (
        !provinceMap
      ) {
        setCoverageData(
          []
        );
        return;
      }

      let districtIndex =
        1;

      const localDistricts:
        CoverageRow[] = [];

      Object.entries(
        provinceMap
      ).forEach(
        ([
          cantonName,
          districtsMap,
        ]) => {

          Object.keys(
            districtsMap
          ).forEach(
            (
              districtName
            ) => {

              localDistricts.push({

                district_id:
                  districtIndex,

                canton:
                  cantonName,

                district:
                  districtName,

                covered_count:
                  0,
                estimated_hours:
                  null,

              });

              districtIndex++;

            }
          );

        }
      );

      const counts =
        await getProvinceCoverageCounts(
          provinceName
        );

      const merged =
        localDistricts.map(
          (
            district
          ) => {

            const match =
              counts.find(
                (
                  item: any
                ) =>

                  item.canton ===
                    district.canton

                  &&

                  item.district ===
                    district.district

              );

           return {

  ...district,

  covered_count:

    Number(

      match?.covered_count || 0

    ),

  estimated_hours:

  match?.estimated_hours ?? null,

};

          }
        );

      setCoverageData(
        merged
      );

    } catch (
      error
    ) {

      console.error(
        error
      );

    }

  }*/

  async function handleViewDistrict(

    row: any

  ) {

    const result =
      await getDistrictNeighborhoods(

        row.district_id,
null
      

      );

    setDialogTitle(

      `${row.canton} → ` +

      `${row.district}`

    );

    setCoveredNeighborhoods(

      result

        .filter(
          (
            item: any
          ) =>

            item.has_coverage

        )

        .map(
          (
            item: any
          ) =>

            item.name

        )

    );

    setUncoveredNeighborhoods(

      result

        .filter(
          (
            item: any
          ) =>

            !item.has_coverage

        )

        .map(
          (
            item: any
          ) =>

            item.name

        )

    );

    setDialogOpen(
      true
    );

  }

  useEffect(
    () => {

      if (
        !selectedProvince
      ) {
        return;
      }

      loadCoverage(
        selectedProvince
      );

    },
    [
      selectedProvince,
    ]
  );

  return (

  <div className="min-h-screen bg-slate-50 p-4 md:p-6">

    {/* HEADER BRAND */}

    <div
      className="
        bg-white
        border
        rounded-2xl
        shadow-sm
        p-4
        md:p-6
        mb-6
      "
    >

      <div
        className="
          flex
          flex-col
          md:flex-row
          items-center
          gap-4
        "
      >

        <Image
          src="/images/agiliza-logo.jpg"
          alt="Agiliza"
          width={120}
          height={120}
          className="object-contain"
        />

        <div className="text-center md:text-left">

          <h1
            className="
              text-3xl
              font-bold
              text-blue-900
            "
          >
            Cobertura Agiliza
          </h1>

          <p
            className="
              text-sm
              text-slate-600
              mt-1
            "
          >
            Gestión territorial y análisis de cobertura logística.
          </p>

        </div>

      </div>

    </div>

    {/* FILTRO */}

    <div
      className="
        bg-white
        border
        rounded-2xl
        shadow-sm
        p-4
        mb-6
      "
    >

      <select

        value={selectedProvince}

        className="
          border
          rounded-xl
          p-3
          min-w-[260px]
          focus:ring-2
          focus:ring-blue-500
          outline-none
        "

        onChange={(e) =>
          setSelectedProvince(
            e.target.value
          )
        }

      >

        <option value="">
          Seleccione provincia
        </option>

        {
          provinces.map(
            (
              province
            ) => (

              <option
                key={province}
                value={province}
              >
                {province}
              </option>

            )
          )
        }

      </select>

    </div>

    {/* TABLA */}

    <div
      className="
        bg-white
        border
        rounded-2xl
        shadow-sm
        p-2
      "
    >

      <ClientCoverageTable
        data={coverageData}
        onViewDistrict={
          handleViewDistrict
        }
      />

    </div>

    <div className="mt-4 text-left flex justify-start">
        <AppVersion /> 
    </div>
 

    {/* DIALOG */}

    <CoverageNeighborhoodsDialog
      open={dialogOpen}
      title={dialogTitle}
      covered={coveredNeighborhoods}
      uncovered={uncoveredNeighborhoods}
      onClose={() =>
        setDialogOpen(false)
      }
    />

  </div>

);

}