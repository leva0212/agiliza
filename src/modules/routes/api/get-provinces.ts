import { supabase } from "@/services/supabase/client";

export async function getProvinces() {
  const { data, error } = await supabase
    .from("provinces")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}