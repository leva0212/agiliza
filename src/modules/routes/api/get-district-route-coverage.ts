import { createClient } from "@/lib/supabase/client";

export type DistrictRouteCoverage = {
  districtId: number;
  routeId: string;
  routeName: string;
  minHours: number | null;
  maxHours: number | null;
  visitDays: string[];
  hasCoverage: boolean;
};

type CoverageRow = {
  route_id: string;
  neighborhoods: { district_id: number } | { district_id: number }[] | null;
  routes: { id: string; name: string; active: boolean } | { id: string; name: string; active: boolean }[] | null;
};

/**
 * Obtiene cada ruta activa que cubre los distritos indicados, junto con su
 * plazo y sus días de visita específicos para el distrito. Una ruta solo se
 * devuelve una vez por distrito, aunque cubra varios barrios de este.
 */
export async function getDistrictRouteCoverage(districtIds: number[]): Promise<DistrictRouteCoverage[]> {
  const ids = [...new Set(districtIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (!ids.length) return [];

  const supabase = createClient();
  const coveragePromise = supabase
    .from("route_coverage")
    .select(`
      route_id,
      neighborhoods!inner(district_id),
      routes!inner(id, name, active)
    `)
    .in("neighborhoods.district_id", ids)
    .eq("routes.active", true);

  const [{ data: coverageRows, error: coverageError }, { data: times, error: timesError }, { data: visitDays, error: visitDaysError }] = await Promise.all([
    coveragePromise,
    supabase.from("route_district_delivery_times")
      .select("route_id, district_id, min_hours, max_hours").in("district_id", ids),
    supabase.from("route_district_visit_days")
      .select("route_id, district_id, day").in("district_id", ids),
  ]);

  if (coverageError) throw coverageError;
  if (timesError) throw timesError;
  if (visitDaysError) throw visitDaysError;

  const coveredRoutes = new Map<string, { districtId: number; routeId: string; routeName: string }>();
  for (const row of (coverageRows ?? []) as CoverageRow[]) {
    const neighborhood = Array.isArray(row.neighborhoods) ? row.neighborhoods[0] : row.neighborhoods;
    const route = Array.isArray(row.routes) ? row.routes[0] : row.routes;
    if (!neighborhood || !route || !route.active) continue;

    const key = `${neighborhood.district_id}:${row.route_id}`;
    coveredRoutes.set(key, {
      districtId: Number(neighborhood.district_id),
      routeId: row.route_id,
      routeName: route.name,
    });
  }

  // Cobertura consulta horarios por distrito independientemente de los barrios.
  // Consultamos routes por separado: visit_days no admite routes!inner.
  const coveredKeys = new Set(coveredRoutes.keys());
  const scheduleRows = [...(times ?? []), ...(visitDays ?? [])];
  const routeIds = [...new Set(scheduleRows.map((row) => row.route_id))];
  if (routeIds.length) {
    const { data: activeRoutes, error: routesError } = await supabase
      .from("routes").select("id, name").in("id", routeIds).eq("active", true);
    if (routesError) throw routesError;
    const names = new Map((activeRoutes ?? []).map((route) => [route.id, route.name]));
    for (const row of scheduleRows) {
      if (!names.has(row.route_id)) continue;
      coveredRoutes.set(`${row.district_id}:${row.route_id}`, {
        districtId: Number(row.district_id), routeId: row.route_id,
        routeName: names.get(row.route_id)!,
      });
    }
  }
  const routes = [...coveredRoutes.values()];

  const timesByRouteAndDistrict = new Map(
    (times ?? []).map((time) => [
      `${time.district_id}:${time.route_id}`,
      { minHours: time.min_hours, maxHours: time.max_hours },
    ]),
  );
  const daysByRouteAndDistrict = new Map<string, string[]>();
  for (const visitDay of visitDays ?? []) {
    const key = `${visitDay.district_id}:${visitDay.route_id}`;
    daysByRouteAndDistrict.set(key, [...(daysByRouteAndDistrict.get(key) ?? []), visitDay.day]);
  }

  return routes
    .map((route) => {
      const key = `${route.districtId}:${route.routeId}`;
      const time = timesByRouteAndDistrict.get(key);
      return {
        ...route,
        minHours: time?.minHours ?? null,
        maxHours: time?.maxHours ?? null,
        visitDays: daysByRouteAndDistrict.get(key) ?? [],
        hasCoverage: coveredKeys.has(key),
      };
    })
    .sort((a, b) => a.routeName.localeCompare(b.routeName, "es"));
}
