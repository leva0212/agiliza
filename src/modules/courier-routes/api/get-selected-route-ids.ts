import { createClient } from "@/lib/supabase/client";

export async function getSelectedRouteIds(
  courierId: string,
): Promise<string[]> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "courier_routes",
      )

      .select(
        "route_id",
      )

      .eq(
        "courier_id",
        courierId,
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map(
    (row) =>
      row.route_id,
  );

}