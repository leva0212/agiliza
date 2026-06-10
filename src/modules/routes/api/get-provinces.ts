import { createClient } from "@/lib/supabase/client";

import type { Province } from "../types/province";

export async function getProvinces(): Promise<Province[]> {
  const supabase = createClient();

  const { data, error } = await supabase

    .from("provinces")

    .select("*")

    .order("id");

  if (error) {
    throw error;
  }

  return (data ?? []) as Province[];
}
