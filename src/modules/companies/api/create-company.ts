import { createClient } from "@/lib/supabase/client";

type Input = {
  code: string;

  name: string;

  tradeName: string;

  address: string;

  contactName: string;

  contactPosition: string;

  active: boolean;

  deliveryCharge: number;

  failedCharge: number;
};

export async function createCompany(
  input: Input,
) {
  const supabase = createClient();

  const {
    data: company,

    error: companyError,
  } = await supabase

    .from("companies")
    .insert({
      code: input.code,

      name: input.name,

      trade_name: input.tradeName,

      address: input.address,

      active: input.active,

      delivery_charge:
        input.deliveryCharge,

      failed_charge:
        input.failedCharge,
    })

    .select()

    .single();

  if (companyError) {
    throw companyError;
  }

  const {
    data: contact,

    error: contactError,
  } = await supabase

    .from("contacts")

    .insert({
      full_name: input.contactName,

      position: input.contactPosition,
    })

    .select()

    .single();

  if (contactError) {
    throw contactError;
  }

  const {
    error: relationError,
  } = await supabase

    .from("company_contacts")

    .insert({
      company_id: company.id,

      contact_id: contact.id,

      is_primary: true,
    });

  if (relationError) {
    throw relationError;
  }

  return company;
}