import { supabase } from "@/services/supabase/client";

export async function deleteRoute(
  routeId: string
) {
  const { error } =
    await supabase
      .from("routes")
      .delete()
      .eq(
        "id",
        routeId
      );

  if (error) {
    throw error;
  }
}