import { createClient } from "@/lib/supabase/client";

import type {
  CourierDeliveryRate,
} from "../types/courier-delivery-rate";

export async function getCourierDeliveryRates(
  routeId: string,

  courierId: string,

  filterRoute: boolean,
): Promise<any[]> {

  const supabase =
    createClient();

  let query =

    supabase

      .from(
        "courier_delivery_rates",
      )

      .select(`
        id,

        route_id,

        route:routes!fk_courier_delivery_rates_route(
          id,
          name
        ),

        courier_id,

        courier:couriers(
          id,
          profile:profiles(
            full_name
          )
        ),

        province_id,

        canton_id,

        district_id,

        neighborhood_id,

        delivery_pay,

        failed_pay,

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
      `);

  if (
    filterRoute &&
    routeId
  ) {

    query =
      query.eq(
        "route_id",
        routeId,
      );

  }

  if (
    courierId
  ) {

    query =
      query.eq(
        "courier_id",
        courierId,
      );

  }

  query =
    query.order(
      "created_at",
      {
        ascending: true,
      },
    );

  const {
    data,
    error,
  } = await query;
  console.log(
    "error",
    error,
  );

  if (
    error
  ) {
    throw error;
  }
  console.log(
    "courier delivery rates raw",
    data,
  );

  console.log(
    "courierId",
    courierId,
  );

  console.log(
    "routeId",
    routeId,
  );
  console.log(
  "courierRates",
  data,
);

  return (data ?? []).map(
    (rate: any) => ({

      ...rate,

      route:
        Array.isArray(
          rate.route,
        )
          ? rate.route[0] ?? null
          : rate.route,

      courier:
        Array.isArray(
          rate.courier,
        )
          ? rate.courier[0] ?? null
          : rate.courier,

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