import type { LocalidadesMap } from "../../localidades_service";

export const LOCALIDADES_PROVINCES = ["SAN JOSÉ", "ALAJUELA", "CARTAGO", "HEREDIA", "GUANACASTE", "PUNTARENAS", "LIMÓN"] as const;

type ProvinceLocalities = LocalidadesMap[string];
type ProvinceLoader = () => Promise<ProvinceLocalities>;

const provinceLoaders: Record<string, ProvinceLoader> = {
  "PUNTARENAS": async () => (await import("./puntarenas")).default,
  "SAN JOSÉ": async () => (await import("./san-jose")).default,
  "LIMÓN": async () => (await import("./limon")).default,
  "CARTAGO": async () => (await import("./cartago")).default,
  "ALAJUELA": async () => (await import("./alajuela")).default,
  "GUANACASTE": async () => (await import("./guanacaste")).default,
  "HEREDIA": async () => (await import("./heredia")).default,
};

export function loadLocalidadesProvince(province: string): Promise<ProvinceLocalities | null> {
  const loader = provinceLoaders[province];
  return loader ? loader() : Promise.resolve(null);
}
