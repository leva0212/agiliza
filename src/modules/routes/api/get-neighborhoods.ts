import { supabase } from "@/services/supabase/client";

export async function getNeighborhoods(
  districtId: number
) {
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .eq("district_id", districtId)
    .order("name");

  if (error) throw error;

  return data;
}