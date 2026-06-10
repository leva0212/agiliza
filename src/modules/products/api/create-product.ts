import { createClient } from "@/lib/supabase/client";

type Input = {

  name: string;

  sku: string;

  defaultDeposit: number | null;

  defaultShippingFee: number | null;

  notes: string;

  active: boolean;

};

export async function createProduct(
  input: Input,
) {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from("products")

      .insert({

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

      .select()

      .single();

  if (error) {
    throw error;
  }

  return data;

}