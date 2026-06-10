import { createClient } from "@/lib/supabase/client";

type Params = {
  pageIndex: number;

  pageSize: number;

  status?: string;
  search?: string;
};

export async function getShipments({
  pageIndex,

  pageSize,

  status,
  search,
}: Params) {
  const supabase = createClient();

  const from = pageIndex * pageSize;

  const to = from + pageSize - 1;

  let query = supabase

    .from("shipments")

    .select(
      `
      id,

      tracking_number,

      company_id,

      courier_id,

      route_id,

      status,

      customer_name,

      customer_identification_type_id,

      customer_identification,

      customer_address,

      receiver_name,

      district_id,

      neighborhood_id,

      latitude,

      longitude,

      notes,

      commercial_notes,

      internal_reference,

      delivered_at,

      created_at,

      company:companies(
        id,
        name
      ),

      route:routes(
        id,
        name,
        estimated_hours
      )
      `,
      {
        count: "exact",
      },
    );

  if (status) {
    query = query.eq("status", status);
  }
  if (search) {
    query = query.ilike("search_text", `%${search}%`);
  }
  /*
if (search) {

  query =

    query.or(

      `tracking_number.ilike.%${search}%,

       customer_name.ilike.%${search}%,

       customer_identification.ilike.%${search}%`

    );

}*/

  const {
    data,

    count,

    error,
  } = await query

    .range(from, to)

    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const normalized = (data || []).map((shipment) => ({
    ...shipment,

    company: Array.isArray(shipment.company)
      ? (shipment.company[0] ?? null)
      : shipment.company,

    route: Array.isArray(shipment.route)
      ? (shipment.route[0] ?? null)
      : shipment.route,
  }));

  return {
    data: normalized,

    total: count || 0,
  };
}
