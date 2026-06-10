import { createClient } from "@/lib/supabase/client";

import type {
  CourierDeliveryRate,
} from "../types/courier-delivery-rate";

export async function getCourierDeliveryRates(
  courierId: string,
  routeId: string,
): Promise<
  CourierDeliveryRate[]
> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from(
      "courier_delivery_rates",
    )

    .select("*")

    .eq(
      "courier_id",
      courierId,
    )

    .eq(
      "route_id",
      routeId,
    )

    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  if (
    error
  ) {
    throw error;
  }

  return data ?? [];
}