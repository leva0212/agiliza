import "dotenv/config";
import { supabaseAdmin } from "@/services/supabase/admin";
import { BarriosService } from "@/barrios.service";

async function importCostaRicaGeo() {
  const geo = BarriosService.barriosMap;

  for (const provinceName in geo) {
    console.log(`Provincia: ${provinceName}`);

    // PROVINCIA
    const { data: province, error: provinceError } = await supabaseAdmin
      .from("provinces")
      .upsert({
        name: provinceName,
      })
      .select()
      .single();

    if (provinceError) {
      console.error("Error provincia:", provinceError);
      continue;
    }

    const cantons = geo[provinceName];

    for (const cantonName in cantons) {
      console.log(`  Cantón: ${cantonName}`);

      // CANTON
      const { data: canton, error: cantonError } = await supabaseAdmin
        .from("cantons")
        .upsert({
          province_id: province.id,
          name: cantonName,
        })
        .select()
        .single();

      if (cantonError) {
        console.error("Error cantón:", cantonError);
        continue;
      }

      const districts = cantons[cantonName];

      for (const districtName in districts) {
        console.log(`    Distrito: ${districtName}`);

        // DISTRITO
        const { data: district, error: districtError } = await supabaseAdmin
          .from("districts")
          .upsert({
            canton_id: canton.id,
            name: districtName,
          })
          .select()
          .single();

        if (districtError) {
          console.error("Error distrito:", districtError);
          continue;
        }

        const neighborhoods =
  districts[districtName];

if (
  provinceName === "SAN JOSÉ" &&
  cantonName === "PÉREZ ZELEDÓN" &&
  districtName.includes("ISIDRO")
) {
  console.log({
    provinceName,
    cantonName,
    districtName,
    neighborhoodsCount:
      neighborhoods.length,
    neighborhoods,
  });
 
}
return
        // BARRIOS
        const barriosToInsert = neighborhoods.map(
          (neighborhoodName: string) => ({
            district_id: district.id,
            name: neighborhoodName,
          })
        );

        const { error: neighborhoodsError } = await supabaseAdmin
          .from("neighborhoods")
          .upsert(barriosToInsert);

        if (neighborhoodsError) {
          console.error("Error barrios:", neighborhoodsError);
        }
      }
    }
  }

  console.log("Importación completada");
}

importCostaRicaGeo();