import { createClient } from "@/lib/supabase/client";

export async function getContactMethods(
  contactId: string,
) {
  const supabase = createClient();

  const {
    data,

    error,
  } = await supabase

    .from("contact_methods")

    .select("*")

    .eq(
      "contact_id",
      contactId,
    )

    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  if (error) {
    throw error;
  }

  return data || [];
}