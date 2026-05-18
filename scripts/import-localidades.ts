import "dotenv/config";

import { LocalidadesService } from "@/services/localidades_service";

import { supabaseAdmin } from "@/services/supabase/admin";

function normalizeType(
  rawType: string,
) {

  if (
    rawType.includes(
      "Barrio",
    )
  ) {
    return "B";
  }

  if (
    rawType.includes(
      "Urbanización",
    )
  ) {
    return "U";
  }

  if (
    rawType.includes(
      "Residencial",
    )
  ) {
    return "R";
  }

  if (
    rawType.includes(
      "Sitio",
    )
  ) {
    return "S";
  }

  if (
    rawType.includes(
      "Caserío",
    )
  ) {
    return "C";
  }

  if (
    rawType.includes(
      "Territorio",
    )
  ) {
    return "T";
  }

  if (
    rawType.includes(
      "Asentamiento",
    )
  ) {
    return "A";
  }

  // default

  return "P";

}

async function run() {

  const geo =

    LocalidadesService.localidadesMap;

  console.log(
    "Actualizando localidades...",
  );

  for (
    const provinceName in geo
  ) {

    const cantons =
      geo[
        provinceName
      ];

    for (
      const cantonName in cantons
    ) {

      const districts =
        cantons[
          cantonName
        ];

      for (
        const districtName in districts
      ) {

        // buscar distrito

        const {

          data: district,

        } = await supabaseAdmin

          .from(
            "districts",
          )

          .select(
            `
              id,
              cantons!inner(
                id,
                name,
                provinces!inner(
                  id,
                  name
                )
              )
            `,
          )

          .eq(
            "name",

            districtName,
          )

          .eq(
            "cantons.name",

            cantonName,
          )

          .eq(
            "cantons.provinces.name",

            provinceName,
          )

          .single();

        if (
          !district
        ) {

          console.warn(

            "Distrito no encontrado:",

            provinceName,

            cantonName,

            districtName,

          );

          continue;

        }

        const localidades =

          districts[
            districtName
          ];

        const rows =

          localidades.map(

            (
              item,
            ) => ({

              district_id:

                district.id,

              name:

                item.nombre.trim(),

              type_code:

                normalizeType(

                  item.tipo,

                ),

              latitude:

                item.lat,

              longitude:

                item.lng,

            }),

          );

        // upsert por nombre+distrito

        const {

          error,

        } = await supabaseAdmin

          .from(
            "neighborhoods",
          )

          .upsert(

            rows,

            {

              onConflict:

                "district_id,name",

            },

          );

        if (
          error
        ) {

          console.error(

            districtName,

            error,

          );

        }

      }

    }

  }

  console.log(
    "Localidades importadas.",
  );

}

run();