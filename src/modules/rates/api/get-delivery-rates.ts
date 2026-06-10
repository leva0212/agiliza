import { createClient } from "@/lib/supabase/client";

import type {
  DeliveryRateDetail,
} from "../types/delivery-rate";
export async function getDeliveryRates(
  routeId: string,
): Promise<DeliveryRateDetail[]> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from(
      "delivery_rates",
    )

    .select(`
  id,

  route_id,

  province_id,

  canton_id,

  district_id,

  neighborhood_id,

  delivery_charge,

  failed_charge,

  active,

  created_at,

  province:provinces(
    id,
    name
  ),

  canton:cantons(
    id,
    name
  ),

  district:districts(
    id,
    name
  ),

  neighborhood:neighborhoods(
    id,
    name
  )
`)

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

  return (data ?? []).map(
    (rate: any) => ({

      ...rate,

      province:
        Array.isArray(
          rate.province,
        )
          ? rate.province[0] ?? null
          : rate.province,

      canton:
        Array.isArray(
          rate.canton,
        )
          ? rate.canton[0] ?? null
          : rate.canton,

      district:
        Array.isArray(
          rate.district,
        )
          ? rate.district[0] ?? null
          : rate.district,

      neighborhood:
        Array.isArray(
          rate.neighborhood,
        )
          ? rate.neighborhood[0] ?? null
          : rate.neighborhood,

    }),
  );
}