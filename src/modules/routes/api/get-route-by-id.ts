import { supabase } from "@/services/supabase/client";

export async function getRouteById(
  routeId: string
) {
  const { data, error } =
    await supabase
      .from("routes")
      .select(`
        id,
        name,
        estimated_hours,

        route_visit_days (
          day
        ),

        route_coverage (
          neighborhood_id
        )
      `)
      .eq(
        "id",
        routeId
      )
      .single();

  if (error) {
    throw error;
  }

  return data;
}