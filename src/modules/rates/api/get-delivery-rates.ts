import { createClient } from "@/lib/supabase/client";

import type {
  DeliveryRateDetail,
} from "../types/delivery-rate";
export async function getDeliveryRates(
  routeId: string,

  companyId: string,

  filterRoute: boolean,

  filterCompany: boolean,
): Promise<DeliveryRateDetail[]> {

  const supabase =
    createClient();

  let query =

    supabase

      .from(
        "delivery_rates",
      )

      .select(`
  id,

route_id,

route:routes(
  id,
  name
),

company_id,

company:companies(
  id,
  name
),

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
    filterCompany &&
    companyId
  ) {

    query =
      query.eq(
        "company_id",
        companyId,
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

  if (
    error
  ) {
    throw error;
  }
  console.log(
    "delivery rates",
    data,
  );

  return (data ?? []).map(
    (rate: any) => ({

      ...rate,
      company:
        Array.isArray(
          rate.company,
        )
          ? rate.company[0] ?? null
          : rate.company,
      route:
        Array.isArray(
          rate.route,
        )
          ? rate.route[0] ?? null
          : rate.route,

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