import { createClient } from "@/lib/supabase/client";

export type DistrictRouteCoverage = {
  districtId: number;
  routeId: string;
  routeName: string;
  minHours: number | null;
  maxHours: number | null;
  visitDays: string[];
};

type CoverageRow = {
  route_id: string;
  neighborhoods: { district_id: number } | { district_id: number }[] | null;
  routes: { id: string; name: string; active: boolean } | { id: string; name: string; active: boolean }[] | null;
};

type RouteScheduleRow = {
  route_id: string;
  district_id: number;
  routes: { id: string; name: string; active: boolean } | { id: string; name: string; active: boolean }[] | null;
};

type DeliveryTimeRow = RouteScheduleRow & {
  min_hours: number;
  max_hours: number;
};

type VisitDayRow = RouteScheduleRow & {
  day: string;
};

function firstRoute(row: { routes: RouteScheduleRow["routes"] }) {
  return Array.isArray(row.routes) ? row.routes[0] : row.routes;
}

/**
 * Obtiene cada ruta activa con cobertura, plazo o días configurados en los
 * distritos indicados. Una ruta solo se devuelve una vez por distrito,
 * aunque cubra varios barrios de este.
 */
export async function getDistrictRouteCoverage(districtIds: number[]): Promise<DistrictRouteCoverage[]> {
  const ids = [...new Set(districtIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (!ids.length) return [];

  const supabase = createClient();
  const [
    { data: coverageRows, error: coverageError },
    { data: times, error: timesError },
    { data: visitDays, error: visitDaysError },
  ] = await Promise.all([
    supabase
      .from("route_coverage")
      .select(`
        route_id,
        neighborhoods!inner(district_id),
        routes!inner(id, name, active)
      `)
      .in("neighborhoods.district_id", ids)
      .eq("routes.active", true),
    supabase
      .from("route_district_delivery_times")
      .select("route_id, district_id, min_hours, max_hours, routes!inner(id, name, active)")
      .in("district_id", ids)
      .eq("routes.active", true),
    supabase
      .from("route_district_visit_days")
      .select("route_id, district_id, day, routes!inner(id, name, active)")
      .in("district_id", ids)
      .eq("routes.active", true),
  ]);

  if (coverageError) throw coverageError;
  if (timesError) throw timesError;
  if (visitDaysError) throw visitDaysError;

  const configuredRoutes = new Map<string, { districtId: number; routeId: string; routeName: string }>();
  for (const row of (coverageRows ?? []) as CoverageRow[]) {
    const neighborhood = Array.isArray(row.neighborhoods) ? row.neighborhoods[0] : row.neighborhoods;
    const route = firstRoute(row);
    if (!neighborhood || !route || !route.active) continue;

    const key = `${neighborhood.district_id}:${row.route_id}`;
    configuredRoutes.set(key, {
      districtId: Number(neighborhood.district_id),
      routeId: row.route_id,
      routeName: route.name,
    });
  }

  for (const row of [...(times ?? []), ...(visitDays ?? [])] as RouteScheduleRow[]) {
    const route = firstRoute(row);
    if (!route || !route.active) continue;
    configuredRoutes.set(`${row.district_id}:${row.route_id}`, {
      districtId: Number(row.district_id),
      routeId: row.route_id,
      routeName: route.name,
    });
  }

  const routes = [...configuredRoutes.values()];

  const timesByRouteAndDistrict = new Map(
    ((times ?? []) as DeliveryTimeRow[]).map((time) => [
      `${time.district_id}:${time.route_id}`,
      { minHours: time.min_hours, maxHours: time.max_hours },
    ]),
  );
  const daysByRouteAndDistrict = new Map<string, string[]>();
  for (const visitDay of (visitDays ?? []) as VisitDayRow[]) {
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
      };
    })
    .sort((a, b) => a.routeName.localeCompare(b.routeName, "es"));
}
