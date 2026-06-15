import { createClient } from "@/lib/supabase/client";

export async function saveCourierRoutes(
  courierId: string,

  routeIds: string[],
) {

  const supabase =
    createClient();

  const {
    error:
      deleteError,
  } =
    await supabase

      .from(
        "courier_routes",
      )

      .delete()

      .eq(
        "courier_id",
        courierId,
      );

  if (deleteError) {
    throw deleteError;
  }

  if (
    routeIds.length === 0
  ) {

    return;

  }

  const {
    error:
      insertError,
  } =
    await supabase

      .from(
        "courier_routes",
      )

      .insert(

        routeIds.map(
          (
            routeId,
          ) => ({

            courier_id:
              courierId,

            route_id:
              routeId,

          }),
        ),

      );

  if (insertError) {
    throw insertError;
  }

}