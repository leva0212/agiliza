import { supabase } from "@/services/supabase/client";

type Params = {
  routeId?: string | null;

  routeName: string;

  estimatedHours: number;

  selectedDays: string[];

  selectedNeighborhoods: number[];

  company_delivery_charge: number;

  courier_delivery_pay: number;

  company_failed_charge: number;

  courier_failed_pay: number;
};

export async function saveRoute({
  routeId,

  routeName,

  estimatedHours,

  selectedDays,

  selectedNeighborhoods,

  company_delivery_charge,

  courier_delivery_pay,

  company_failed_charge,

  courier_failed_pay,
}: Params) {

  let currentRouteId =
    routeId;

  // EDITAR

  if (
    routeId
  ) {

    const {
      error,
    } =
      await supabase
        .from(
          "routes"
        )
        .update({
          name:
            routeName,

          estimated_hours:
            estimatedHours,

          company_delivery_charge,

          courier_delivery_pay,

          company_failed_charge,

          courier_failed_pay,
        })
        .eq(
          "id",
          routeId
        );

    if (
      error
    ) {
      throw error;
    }

    await supabase
      .from(
        "route_visit_days"
      )
      .delete()
      .eq(
        "route_id",
        routeId
      );

    await supabase
      .from(
        "route_coverage"
      )
      .delete()
      .eq(
        "route_id",
        routeId
      );

  }

  // CREAR

  else {

    const {
      data,

      error,
    } =
      await supabase
        .from(
          "routes"
        )
        .insert({
          name:
            routeName,

          estimated_hours:
            estimatedHours,

          company_delivery_charge,

          courier_delivery_pay,

          company_failed_charge,

          courier_failed_pay,
        })
        .select()
        .single();

    if (
      error
    ) {
      throw error;
    }

    currentRouteId =
      data.id;

  }

  // DÍAS

  if (
    selectedDays.length >
    0
  ) {

    await supabase
      .from(
        "route_visit_days"
      )
      .insert(
        selectedDays.map(
          (
            day
          ) => ({
            route_id:
              currentRouteId,

            day:
              day.toLowerCase(),
          })
        )
      );

  }

  // COBERTURA

  await supabase
    .from(
      "route_coverage"
    )
    .insert(
      selectedNeighborhoods.map(
        (
          neighborhoodId
        ) => ({
          route_id:
            currentRouteId,

          neighborhood_id:
            neighborhoodId,
        })
      )
    );

  return currentRouteId;
}