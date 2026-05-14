import { BarriosService } from "@/barrios.service";

const geo = BarriosService.barriosMap;

for (const provinceName in geo) {
  const cantons = geo[provinceName];

  for (const cantonName in cantons) {
    const districts = cantons[cantonName];

    for (const districtName in districts) {
      const neighborhoods =
        districts[districtName];
        console.log(
          `${provinceName} → ` +
          `${cantonName} → ` +
          `${districtName} → ` +
          `barrios: ${neighborhoods.length}`
        );
      

     /* if (
        neighborhoods.length === 0
      ) {
        console.log(
          `${provinceName} → ` +
          `${cantonName} → ` +
          `${districtName} → ` +
          `barrios: 0`
        );
      }*/
    }
  }
  console.log("FIN " + provinceName);
}