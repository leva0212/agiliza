import { createClient } from "@/lib/supabase/client";

export async function deleteContactMethod(
  id: string,
) {
  const supabase = createClient();

  const {
    error,
  } = await supabase

    .from("contact_methods")

    .delete()

    .eq(
      "id",
      id,
    );

  if (error) {
    throw error;
  }

  return true;
}