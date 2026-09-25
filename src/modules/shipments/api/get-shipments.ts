import { createClient } from "@/lib/supabase/client";

type Params = {
  pageIndex: number;
  pageSize: number;
  status?: string;
  search?: string;
  companyId?: string;
  routeId?: string;
  courierId?: string;
  deliveryHours?: number;
  visitDay?: string;
};

type FilteredShipmentId = {
  id: string;
  total_count: number | string;
};

export async function getShipments({
  pageIndex,
  pageSize,
  status,
  search,
  companyId,
  routeId,
  courierId,
  deliveryHours,
  visitDay,
}: Params) {
  const supabase = createClient();
  const from = pageIndex * pageSize;
  const usesScheduleFilter = deliveryHours !== undefined || Boolean(visitDay) || Boolean(courierId);

  let shipmentIds: string[] | undefined;
  let filteredTotal: number | undefined;

  if (usesScheduleFilter) {
    const { data: filteredRows, error: filterError } = await supabase.rpc(
      "get_filtered_shipment_ids",
      {
        p_company_id: companyId || null,
        p_route_id: routeId || null,
        p_courier_id: courierId || null,
        p_delivery_hours: deliveryHours ?? null,
        p_visit_day: visitDay || null,
        p_status: status || null,
        p_search: search || null,
        p_limit: pageSize,
        p_offset: from,
      },
    );

    if (filterError) {
      throw filterError;
    }

    const rows = (filteredRows ?? []) as FilteredShipmentId[];
    shipmentIds = rows.map((row) => row.id);
    filteredTotal = rows.length > 0 ? Number(rows[0].total_count) : 0;

    if (shipmentIds.length === 0) {
      return { data: [], total: filteredTotal };
    }
  }

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
      company:companies(id, name),
      route:routes(id, name, estimated_hours)
      `,
      { count: "exact" },
    );

  if (usesScheduleFilter) {
    query = query.in("id", shipmentIds!);
  } else {
    if (status) query = query.eq("status", status);
    if (search) query = query.ilike("search_text", `%${search}%`);
    if (companyId) query = query.eq("company_id", companyId);
    if (routeId) query = query.eq("route_id", routeId);
    if (courierId) query = query.eq("courier_id", courierId);
    query = query.range(from, from + pageSize - 1);
  }

  const { data, count, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;

  const shipments = data ?? [];
  const routeIds = [...new Set(shipments.map((shipment) => shipment.route_id).filter((id): id is string => Boolean(id)))];
  const districtIds = [...new Set(shipments.map((shipment) => shipment.district_id).filter((id): id is number => typeof id === "number"))];

  const { data: deliveryTimes, error: deliveryTimesError } = routeIds.length && districtIds.length
    ? await supabase
      .from("route_district_delivery_times")
      .select("route_id, district_id, min_hours, max_hours")
      .in("route_id", routeIds)
      .in("district_id", districtIds)
    : { data: [], error: null };

  if (deliveryTimesError) throw deliveryTimesError;

  const deliveryByRouteDistrict = new Map(
    (deliveryTimes ?? []).map((time) => [`${time.route_id}:${time.district_id}`, time]),
  );

  const normalized = shipments.map((shipment) => {
    const delivery = shipment.route_id && shipment.district_id
      ? deliveryByRouteDistrict.get(`${shipment.route_id}:${shipment.district_id}`)
      : undefined;

    return {
      ...shipment,
      delivery_min_hours: delivery?.min_hours ?? null,
      delivery_max_hours: delivery?.max_hours ?? null,
      company: Array.isArray(shipment.company) ? (shipment.company[0] ?? null) : shipment.company,
      route: Array.isArray(shipment.route) ? (shipment.route[0] ?? null) : shipment.route,
    };
  });

  return {
    data: normalized,
    total: filteredTotal ?? count ?? 0,
  };
}
