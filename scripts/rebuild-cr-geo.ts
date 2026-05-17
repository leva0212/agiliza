import "dotenv/config";

import { BarriosService } from "@/barrios_service";

import { supabaseAdmin } from "@/services/supabase/admin";

async function rebuildCostaRicaGeo() {

  const geo =
    BarriosService.barriosMap;

  console.log(
    "LIMPIANDO..."
  );

  // tablas dependientes primero

  await supabaseAdmin

    .from(
      "route_coverage"
    )

    .delete()

    .neq(
      "route_id",
      "00000000-0000-0000-0000-000000000000"
    );

  await supabaseAdmin

    .from(
      "route_district_delivery_times"
    )

    .delete()

    .neq(
      "id",
      0
    );

  await supabaseAdmin

    .from(
      "route_district_visit_days"
    )

    .delete()

    .neq(
      "id",
      0
    );

  await supabaseAdmin

    .from(
      "neighborhoods"
    )

    .delete()

    .neq(
      "id",
      0
    );

  await supabaseAdmin

    .from(
      "districts"
    )

    .delete()

    .neq(
      "id",
      0
    );

  await supabaseAdmin

    .from(
      "cantons"
    )

    .delete()

    .neq(
      "id",
      0
    );

  await supabaseAdmin

    .from(
      "provinces"
    )

    .delete()

    .neq(
      "id",
      0
    );
    // resetear IDs

await supabaseAdmin.rpc(
  "exec_sql",
  {
    sql: `

      ALTER SEQUENCE provinces_id_seq RESTART WITH 1;

      ALTER SEQUENCE cantons_id_seq RESTART WITH 1;

      ALTER SEQUENCE districts_id_seq RESTART WITH 1;

      ALTER SEQUENCE neighborhoods_id_seq RESTART WITH 1;

    `,
  },
);

console.log(
  "SEQUENCES RESETEADOS..."
);

  console.log(
    "IMPORTANDO..."
  );

  for (
    const provinceName in geo
  ) {
      console.log(
    provinceName
  );

    const {

      data: province,

      error:
        provinceError,

    } = await supabaseAdmin

      .from(
        "provinces"
      )

      .insert({

        name:
          provinceName.trim(),

      })

      .select()

      .single();

    if (
      provinceError ||
      !province
    ) {

      console.error(
        provinceError
      );

      continue;

    }

    const cantons =
      geo[provinceName];

    for (
      const cantonName in cantons
    ) {
       console.log(
    cantonName
  );

      const {

        data: canton,

        error:
          cantonError,

      } = await supabaseAdmin

        .from(
          "cantons"
        )

        .insert({

          province_id:
            province.id,

          name:
            cantonName.trim(),

        })

        .select()

        .single();

      if (
        cantonError ||
        !canton
      ) {

        console.error(
          cantonError
        );

        continue;

      }

      const districts =
        cantons[
          cantonName
        ];

      for (
        const districtName in districts
      ) {
         console.log(
    districtName
  );

        const {

          data: district,

          error:
            districtError,

        } = await supabaseAdmin

          .from(
            "districts"
          )

          .insert({

            canton_id:
              canton.id,

            name:
              districtName.trim(),

          })

          .select()

          .single();

        if (
          districtError ||
          !district
        ) {

          console.error(
            districtError
          );

          continue;

        }

        const neighborhoods =

          districts[
            districtName
          ];

        if (
          neighborhoods.length === 0
        ) {

          continue;

        }

        const rows =

          neighborhoods.map(
            

            (
              neighborhoodName
            ) => ({
              

              district_id:
                district.id,

              name:
                neighborhoodName.trim(),

            }) ,

          );

          
  
        const {

          error:
            neighborhoodError,

        } = await supabaseAdmin

          .from(
            "neighborhoods"
          )

          .insert(
            rows
          );

        if (
          neighborhoodError
        ) {

          console.error(

            districtName,

            neighborhoodError

          );

        }

      }

    }

  }

  console.log(
    "IMPORTACIÓN FINALIZADA"
  );

}

rebuildCostaRicaGeo();