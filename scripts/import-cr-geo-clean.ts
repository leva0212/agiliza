import fs from "fs";
import path from "path";

import { BarriosService } from "@/barrios.service";
import { supabaseAdmin } from "@/services/supabase/admin";

const geo = BarriosService.barriosMap;

const logs: string[] = [];

function log(message: string) {
  console.log(message);
  logs.push(message);
}

async function run() {
  log("==================================");
  log("INICIO IMPORTACION COSTA RICA");
  log("==================================");

  for (const provinceName in geo) {
    log(``);
    log(`PROVINCIA: ${provinceName}`);

    const { data: province, error: provinceError } =
      await supabaseAdmin
        .from("provinces")
        .insert({
          name: provinceName.trim(),
        })
        .select()
        .single();

    if (provinceError || !province) {
      log(
        `ERROR PROVINCIA: ${provinceName}`
      );
      log(
        JSON.stringify(provinceError)
      );

      continue;
    }

    const cantons =
      geo[provinceName];

    for (const cantonName in cantons) {
      log(
        `  CANTON: ${cantonName}`
      );

      const {
        data: canton,
        error: cantonError,
      } =
        await supabaseAdmin
          .from("cantons")
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
        log(
          `  ERROR CANTON: ${cantonName}`
        );

        log(
          JSON.stringify(
            cantonError
          )
        );

        continue;
      }

      const districts =
        cantons[cantonName];

      for (
        const districtName in districts
      ) {
        log(
          `    DISTRITO: ${districtName}`
        );

        const {
          data: district,
          error:
            districtError,
        } =
          await supabaseAdmin
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
          log(
            `    ERROR DISTRITO: ${districtName}`
          );

          log(
            JSON.stringify(
              districtError
            )
          );

          continue;
        }

        // Raw neighborhoods
        const rawNeighborhoods =
          districts[
            districtName
          ];

        // Detect duplicates
        const duplicates =
          rawNeighborhoods.filter(
            (
              item,
              index
            ) =>
              rawNeighborhoods.indexOf(
                item
              ) !== index
          );

        if (
          duplicates.length >
          0
        ) {
          log(
            `    DUPLICADOS DETECTADOS: ${[
              ...new Set(
                duplicates
              ),
            ].join(", ")}`
          );
        }

        // Remove duplicates
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

        // Empty district
        if (
          uniqueNeighborhoods.length ===
          0
        ) {
          log(
            `    WARNING: DISTRITO SIN BARRIOS`
          );

          continue;
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
          error:
            neighborhoodsError,
        } =
          await supabaseAdmin
            .from(
              "neighborhoods"
            )
            .insert(
              payload
            );

        if (
          neighborhoodsError
        ) {
          log(
            `    ERROR BARRIOS`
          );

          log(
            JSON.stringify(
              neighborhoodsError
            )
          );

          continue;
        }

        log(
          `    OK BARRIOS: ${payload.length}`
        );
      }
    }

    log(
      `FIN ${provinceName}`
    );
  }

  log("");
  log(
    "=================================="
  );

  log(
    "IMPORTACION COMPLETADA"
  );

  log(
    "=================================="
  );

  // Save log file
  const logPath =
    path.join(
      process.cwd(),
      "import-log.txt"
    );

  fs.writeFileSync(
    logPath,
    logs.join("\n"),
    "utf-8"
  );

  console.log(
    `LOG GUARDADO EN: ${logPath}`
  );
}

run();