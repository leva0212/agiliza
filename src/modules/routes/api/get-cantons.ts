import { supabase } from "@/services/supabase/client";

export async function getCantons(
  provinceId: number
) {
  const { data, error } = await supabase
    .from("cantons")
    .select("*")
    .eq("province_id", provinceId)
    .order("id");

  if (error) throw error;

  return data;
}