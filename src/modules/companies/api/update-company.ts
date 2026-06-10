import { createClient } from "@/lib/supabase/client";

type Input = {
  id: string;

  code: string;

  name: string;

  tradeName: string;

  address: string;

  contactName: string;

  contactPosition: string;

  active: boolean;
};

export async function updateCompany(
  input: Input,
) {

    const supabase = createClient();

  const {
    error: companyError,
  } = await supabase

    .from("companies")

    .update({
      code: input.code,

      name: input.name,

      trade_name:
        input.tradeName,

      address:
        input.address,

      active:
        input.active,
    })

    .eq(
      "id",
      input.id,
    );

  if (companyError) {
    throw companyError;
  }

  const {
    data: relation,

    error: relationError,
  } = await supabase

    .from("company_contacts")

    .select(
      "contact_id",
    )

    .eq(
      "company_id",
      input.id,
    )

    .eq(
      "is_primary",
      true,
    )

    .single();

  if (relationError) {
    throw relationError;
  }

  const {
    error: contactError,
  } = await supabase

    .from("contacts")

    .update({
      full_name:
        input.contactName,

      position:
        input.contactPosition,
    })

    .eq(
      "id",
      relation.contact_id,
    );

  if (contactError) {
    throw contactError;
  }

  return true;
}