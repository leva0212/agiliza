import { createClient } from "@/lib/supabase/client";

type Input = {

  contactId: string;

  methodType: string;

  value: string;

  label: string;

  isPrimary: boolean;
};

export async function createContactMethod(
  input: Input,
) {
  const supabase = createClient();

  const {
    data,

    error,
  } = await supabase

    .from("contact_methods")

    .insert({

      contact_id:
        input.contactId,

      method_type:
        input.methodType,

      value:
        input.value,

      label:
        input.label,

      is_primary:
        input.isPrimary,

      active: true,
    })

    .select()

    .single();

  if (error) {
    throw error;
  }

  return data;
}