import { createClient } from "@/lib/supabase/client";

export async function deleteCourierDeliveryRate(
  id: string,
) {

  const supabase =
    createClient();

  const {
    error,
  } = await supabase

    .from(
      "courier_delivery_rates",
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