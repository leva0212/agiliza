import { createClient } from "@/lib/supabase/client";

import type { Neighborhood } from "../types/neighborhood";

export async function getNeighborhoods(
  districtId: number,
): Promise<Neighborhood[]> {
  const supabase = createClient();

  const { data, error } = await supabase

    .from("neighborhoods")

    .select("*")

    .eq("district_id", districtId)

    .order("name");

  if (error) {
    throw error;
  }

  return (data ?? []) as Neighborhood[];
}
