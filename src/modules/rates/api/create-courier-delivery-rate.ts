import { createClient } from "@/lib/supabase/client";

export async function createCourierDeliveryRate(
  input: {

    courier_id: string;

    route_id: string;

    province_id?: number | null;

    canton_id?: number | null;

    district_id?: number | null;

    neighborhood_id?: number | null;

    delivery_pay: number;

    failed_pay: number;

  },
) {

  const supabase =
    createClient();

  const {
    error,
  } = await supabase

    .from(
      "courier_delivery_rates",
    )

    .insert({

      courier_id:
        input.courier_id,

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

      delivery_pay:
        input.delivery_pay,

      failed_pay:
        input.failed_pay,

      active:
        true,

    });

  if (
    error
  ) {
    throw error;
  }

}