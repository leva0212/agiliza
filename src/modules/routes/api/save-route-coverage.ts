import { supabase } from "@/services/supabase/client";

export async function saveRouteCoverage(
  routeId: string,
  neighborhoodIds: number[]
) {
  const payload =
    neighborhoodIds.map(
      (neighborhoodId) => ({
        route_id: routeId,

        neighborhood_id:
          neighborhoodId,
      })
    );

  const { error } =
    await supabase
      .from("route_coverage")
      .insert(payload);

  if (error) throw error;
}