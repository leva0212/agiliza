import { createClient } from "@/lib/supabase/client";

export async function deleteRoute(
  routeId: string
) {
  const supabase = createClient();
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