import "dotenv/config";

import fs from "fs";

import path from "path";

import { LocalidadesService } from "@/services/localidades_service";

import { supabaseAdmin } from "@/services/supabase/admin";

const logsDir = path.join(
  process.cwd(),

  "logs",
);

const logFile = path.join(
  logsDir,

  "rebuild-cr-localidades.log",
);

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

function log(message: string) {
  const timestamp = new Date().toLocaleTimeString();

  const line = `[${timestamp}] ${message}`;

  console.log(line);

  fs.appendFileSync(
    logFile,

    `${line}\n`,
  );
}

function normalizeType(rawType: string) {
  if (rawType.includes("Barrio")) {
    return "B";
  }

  if (rawType.includes("Urbanización")) {
    return "U";
  }

  if (rawType.includes("Residencial")) {
    return "R";
  }

  if (rawType.includes("Sitio")) {
    return "S";
  }

  if (rawType.includes("Caserío")) {
    return "C";
  }

  if (rawType.includes("Territorio")) {
    return "T";
  }

  if (rawType.includes("Asentamiento")) {
    return "A";
  }

  if (rawType.includes("Condominio")) {
    return "CH";
  }

  return "P";
}

async function run() {
  fs.writeFileSync(
    logFile,

    "",
  );

  let totalInserted = 0;

  let totalDistricts = 0;

  log("===== INICIO IMPORTACION =====");

  const geo = LocalidadesService.localidadesMap;

  log("Limpiando BD...");

  await supabaseAdmin

    .from("route_coverage")

    .delete()

    .neq(
      "route_id",

      "00000000-0000-0000-0000-000000000000",
    );

  await supabaseAdmin

    .from("route_district_delivery_times")

    .delete()

    .neq(
      "id",

      0,
    );

  await supabaseAdmin

    .from("route_district_visit_days")

    .delete()

    .neq(
      "id",

      0,
    );

  await supabaseAdmin

    .from("neighborhoods")

    .delete()

    .neq(
      "id",

      0,
    );

  await supabaseAdmin

    .from("districts")

    .delete()

    .neq(
      "id",

      0,
    );

  await supabaseAdmin

    .from("cantons")

    .delete()

    .neq(
      "id",

      0,
    );

  await supabaseAdmin

    .from("provinces")

    .delete()

    .neq(
      "id",

      0,
    );

    log(
  "Reiniciando secuencias...",
);

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

  log("Insertando...");

  for (const provinceName in geo) {
    log(`Provincia: ${provinceName}`);

    const { data: province } = await supabaseAdmin

      .from("provinces")

      .insert({
        name: provinceName.trim(),
      })

      .select()

      .single();

    const cantons = geo[provinceName];

    for (const cantonName in cantons) {
      log(`  Canton: ${cantonName}`);

      const { data: canton } = await supabaseAdmin

        .from("cantons")

        .insert({
          province_id: province.id,

          name: cantonName.trim(),
        })

        .select()

        .single();

      const districts = cantons[cantonName];

      for (const districtName in districts) {
        totalDistricts++;

        const { data: district } = await supabaseAdmin

          .from("districts")

          .insert({
            canton_id: canton.id,

            name: districtName.trim(),
          })

          .select()

          .single();

        const localidades = districts[districtName];

        // contador por nombre+tipo

        const duplicatesCounter = new Map();

        const rows = localidades.map((item: any) => {
          const typeCode = normalizeType(item.tipo);

          const key = `${item.nombre.trim()}_${typeCode}`;

          const currentCount = duplicatesCounter.get(key) || 0;

          const positionIndex = currentCount + 1;

          duplicatesCounter.set(
            key,

            positionIndex,
          );

          if (positionIndex > 1) {
            log(
              `      DUPLICADO DETECTADO: ${item.nombre} (${typeCode}) POS ${positionIndex}`,
            );
          }

          return {
            district_id: district.id,

            name: item.nombre.trim(),

            type_code: typeCode,

            position_index: positionIndex,

            latitude: item.lat,

            longitude: item.lng,
          };
        });

        const { error } = await supabaseAdmin

          .from("neighborhoods")

          .insert(rows);

        if (error) {
          log(`    ERROR ${districtName}: ${error.message}`);

          continue;
        }

        totalInserted += rows.length;

        log(`    Distrito: ${districtName} -> ${rows.length} localidades`);
      }
    }
  }

  log("===== FIN =====");

  log(`Distritos: ${totalDistricts}`);

  log(`Localidades insertadas: ${totalInserted}`);
}

run();
