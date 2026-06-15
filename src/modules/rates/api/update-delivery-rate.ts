import { createClient } from "@/lib/supabase/client";

import type {
  CreateDeliveryRateInput,
} from "../types/delivery-rate";

export async function updateDeliveryRate(
  id: string,
  input: CreateDeliveryRateInput,
) {

  const supabase =
    createClient();

  const {
    error,
  } = await supabase

    .from(
      "delivery_rates",
    )

    .update({

      province_id:
        input.province_id ??
        null,

      canton_id:
        input.canton_id ??
        null,

      district_id:
        input.district_id ??
        null,

      neighborhood_id:
        input.neighborhood_id ??
        null,

      delivery_charge:
        input.delivery_charge,

      failed_charge:
        input.failed_charge,

    })

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