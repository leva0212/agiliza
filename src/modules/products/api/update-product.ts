import { createClient } from "@/lib/supabase/client";

type Input = {

  id: string;

  name: string;

  sku: string;

  defaultDeposit: number | null;

  defaultShippingFee: number | null;

  notes: string;

  active: boolean;

};

export async function updateProduct(
  input: Input,
) {

  const supabase =
    createClient();

  const {
    error,
  } =
    await supabase

      .from("products")

      .update({

        name:
          input.name,

        sku:
          input.sku,

        default_deposit:
          input.defaultDeposit,

        default_shipping_fee:
          input.defaultShippingFee,

        notes:
          input.notes,

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