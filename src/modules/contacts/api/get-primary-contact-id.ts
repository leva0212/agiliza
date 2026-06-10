import { createClient } from "@/lib/supabase/client";

export async function getPrimaryContactId(
  companyId: string,
) {

  const supabase = createClient();
  const {
    data,

    error,
  } = await supabase

    .from("company_contacts")

    .select(
      "contact_id",
    )

    .eq(
      "company_id",
      companyId,
    )

    .eq(
      "is_primary",
      true,
    )

    .single();

  if (error) {
    throw error;
  }

  return data.contact_id;
}