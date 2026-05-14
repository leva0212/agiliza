import { BarriosService } from "@/barrios.service";

import { supabaseAdmin } from "@/services/supabase/admin";

const failedDistrictIds = [
  3,
  106,
  124,
  129,
  154,
  178,
  197,
  253,
  279,
  323,
  344,
  360,
  373,
  375,
  376,
  400,
  421,
  432,
  435,
  437,
  442,
  444,
  458,
  461,
  484,
];

async function run() {
  const geo =
    BarriosService.barriosMap;

  for (
    const provinceName in geo
  ) {
    const cantons =
      geo[provinceName];

    for (
      const cantonName in cantons
    ) {
      const districts =
        cantons[cantonName];

      for (
        const districtName in districts
      ) {
        const {
          data: district,
        } =
          await supabaseAdmin
            .from(
              "districts"
            )
            .select(
              `
                id,
                cantons!inner(
                  name,
                  provinces!inner(
                    name
                  )
                )
              `
            )
            .eq(
              "name",
              districtName
            )
            .single();

        if (
          !district
        ) {
          continue;
        }

        if (
          !failedDistrictIds.includes(
            district.id
          )
        ) {
          continue;
        }

        const rawNeighborhoods =
          districts[
            districtName
          ];

        const duplicates =
          rawNeighborhoods.filter(
            (
              name,
              index
            ) =>
              rawNeighborhoods.indexOf(
                name
              ) !== index
          );

        const uniqueNeighborhoods =
          [
            ...new Set(
              rawNeighborhoods.map(
                (
                  name: string
                ) =>
                  name.trim()
              )
            ),
          ];

        console.log(
          "Procesando:"
        );

        console.log(
          `${provinceName} → ` +
            `${cantonName} → ` +
            `${districtName}`
        );

        if (
          duplicates.length >
          0
        ) {
          console.log(
            "Duplicados:",
            [
              ...new Set(
                duplicates
              ),
            ]
          );
        }

        const payload =
          uniqueNeighborhoods.map(
            (
              neighborhoodName: string
            ) => ({
              district_id:
                district.id,

              name:
                neighborhoodName,
            })
          );

        const {
          error,
        } =
          await supabaseAdmin
            .from(
              "neighborhoods"
            )
            .insert(
              payload
            );

        if (
          error
        ) {
          console.error(
            "Error:",
            error
          );
        } else {
          console.log(
            `OK → ${payload.length} barrios`
          );
        }

        console.log(
          "----------------"
        );
      }
    }
  }

  console.log(
    "Reinserción completada"
  );
}

run();