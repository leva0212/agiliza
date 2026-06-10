import { createClient } from "@/lib/supabase/client";

export async function getPermissions() {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "permissions",
      )

      .select("*")

      .order("description");

  if (error) {
    throw error;
  }

  return data ?? [];

}