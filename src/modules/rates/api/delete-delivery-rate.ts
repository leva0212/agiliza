import { createClient } from "@/lib/supabase/client";

export async function deleteDeliveryRate(
  id: string,
) {

  const supabase =
    createClient();

  const {
    error,
  } = await supabase

    .from(
      "delivery_rates",
    )

    .delete()

    .eq(
      "id",
      id,
    );

  if (
    error
  ) {
    throw error;
  }

}