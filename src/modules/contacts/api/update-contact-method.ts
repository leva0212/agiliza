import { createClient } from "@/lib/supabase/client";
type Input = {
  id: string;

  methodType: string;

  label: string;

  value: string;

  isPrimary: boolean;

  active: boolean;
};

export async function updateContactMethod(
  input: Input,
) {
  const supabase = createClient();

  const {
    error,
  } = await supabase

    .from("contact_methods")

    .update({

      method_type:
        input.methodType,

      label:
        input.label,

      value:
        input.value,

      is_primary:
        input.isPrimary,

      active:
        input.active,

    })

    .eq(
      "id",
      input.id,
    );

  if (error) {
    throw error;
  }

  return true;
}