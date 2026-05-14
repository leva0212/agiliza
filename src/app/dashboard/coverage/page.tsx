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

type CoverageRow = {

  district_id: number;

  canton: string;

  district: string;

  covered_count: number;

  estimated_hours: number | null;

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

            // si existe en BD,
            // usar el ID real
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

              ??

              null,

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

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">

        Consulta de cobertura

      </h1>

      <select

        value={
          selectedProvince
        }

        className="border min-w-[250px] rounded-lg p-3 mb-6"

        onChange={(
          e
        ) =>

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

                key={
                  province
                }

                value={
                  province
                }

              >

                {
                  province
                }

              </option>

            )
          )
        }

      </select>

      <ClientCoverageTable

        data={
          coverageData
        }

        onViewDistrict={
          handleViewDistrict
        }

      />

      <CoverageNeighborhoodsDialog

        open={
          dialogOpen
        }

        title={
          dialogTitle
        }

        covered={
          coveredNeighborhoods
        }

        uncovered={
          uncoveredNeighborhoods
        }

        onClose={() =>

          setDialogOpen(
            false
          )

        }

      />

    </div>

  );

}