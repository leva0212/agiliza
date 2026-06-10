import { createClient } from "@/lib/supabase/client";

export async function getCompaniesOptions() {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from("companies")

    .select(`
  id,
  name,
  is_system_company
`)

    .eq(
      "active",
      true,
    )

    .order(
      "name",
    );

  if (error) {
    throw error;
  }

  return data ?? [];

}