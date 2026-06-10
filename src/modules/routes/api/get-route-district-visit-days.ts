import { createClient } from "@/lib/supabase/client";

export async function getRouteDistrictVisitDays(
  routeId: string,
) {
  const supabase = createClient();

  const {

    data,

    error,

  } = await supabase

    .from(
      "route_district_visit_days"
    )

    .select(
      "district_id, day"
    )

    .eq(
      "route_id",
      routeId
    );

  if (
    error
  ) {

    throw error;

  }

  return data || [];

}