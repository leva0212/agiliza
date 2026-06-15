import { createClient } from "@/lib/supabase/client";

export async function getRoutesOptions() {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from(
      "routes",
    )

    .select(`
      id,
      name
    `)

    .order(
      "name",
    );

  if (error) {
    throw error;
  }

  return data ?? [];

}