import { createClient } from "@/lib/supabase/client";

export async function getCompanyById(
  companyId: string,
) {
  const supabase = createClient();

  const {
    data: company,

    error,
  } = await supabase

    .from("companies")

    .select("*")

    .eq(
      "id",
      companyId,
    )

    .single();

  if (error) {
    throw error;
  }

  const {
    data: relations,
  } = await supabase

    .from("company_contacts")

    .select(`
      is_primary,

      contact:contacts(
        id,
        full_name,
        position
      )
    `)

    .eq(
      "company_id",
      companyId,
    );

  const primary =
    relations?.find(
      (relation) =>
        relation.is_primary,
    );

  return {

    ...company,

    primary_contact:
      primary?.contact ||
      null,
  };
}