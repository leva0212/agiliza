import { createClient } from "@/lib/supabase/client";

import type {
  CreateDeliveryRateInput,
} from "../types/delivery-rate";

export async function createDeliveryRate(
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

    .insert({
      company_id:
        input.company_id,

      route_id:
        input.route_id,

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

      active:
        true,

    });

  if (
    error
  ) {
    throw error;
  }

}