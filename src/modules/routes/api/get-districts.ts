import { supabase } from "@/services/supabase/client";

export async function getDistricts(
  cantonId: number
) {
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .eq("canton_id", cantonId)
    .order("id");

  if (error) throw error;

  return data;
}