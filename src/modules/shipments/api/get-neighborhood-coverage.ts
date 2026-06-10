import { createClient } from "@/lib/supabase/client";

export type NeighborhoodCoverage = {
  route_id: string;

  route_name: string;

  min_hours: number;

  max_hours: number;

  visit_days: string[];
};

type RouteData = {
  id: string;

  name: string;
};

export async function getNeighborhoodCoverage(
  neighborhoodId: number,
  districtId: number,
): Promise<NeighborhoodCoverage[]> {
  const supabase = createClient();

  const { data, error } = await supabase

    .from("route_coverage")

    .select(
      `
        route_id,

        routes (
          id,
          name,
          estimated_hours,
          company_delivery_charge,
          company_failed_charge
        )
      `,
    )

    .eq("neighborhood_id", neighborhoodId);

  if (error) {
    throw error;
  }
  const routeIds = (data ?? []).map((row) => row.route_id);

  const { data: deliveryTimes, error: deliveryError } = await supabase

    .from("route_district_delivery_times")

    .select(
      `
    route_id,
    district_id,
    min_hours,
    max_hours
  `,
    )

    .eq("district_id", districtId)

    .in("route_id", routeIds);

  if (deliveryError) {
    throw deliveryError;
  }

  const {
  data: visitDays,
  error: visitDaysError,
} = await supabase

  .from(
    "route_district_visit_days",
  )

  .select(`
    route_id,
    district_id,
    day
  `)

  .eq(
    "district_id",
    districtId,
  )

  .in(
    "route_id",
    routeIds,
  );

if (
  visitDaysError
) {
  throw visitDaysError;
}

  return (data ?? []).flatMap((row) => {
    const route = (
      Array.isArray(row.routes) ? row.routes[0] : row.routes
    ) as RouteData | null;

    if (!route) {
      return [];
    }

    const delivery = deliveryTimes?.find((item) => item.route_id === route.id);
    const routeVisitDays =

  visitDays

    ?.filter(
      item =>

        item.route_id ===
          route.id,
    )

    .map(
      item => item.day,
    )

  ?? [];

    return [
     {
  route_id: route.id,

  route_name: route.name,

  min_hours:
    delivery?.min_hours ?? 0,

  max_hours:
    delivery?.max_hours ?? 0,

  visit_days:
    routeVisitDays,
}
    ];
  });
}
