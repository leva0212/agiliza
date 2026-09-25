import { createClient } from "@/lib/supabase/client";
import type { ShipmentDetail } from "../types/shipment";

export async function getShipment(shipmentId: string): Promise<ShipmentDetail> {
  const supabase = createClient();

  const { data, error } = await supabase

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
      identification_type:identification_types(id,name),

      customer_identification,

      customer_address,

      receiver_name,

      district_id,

      neighborhood_id,

      latitude,

      longitude,
      customer_latitude,
      customer_longitude,
      customer_location_accuracy_meters,
      customer_location_received_at,

      notes,

      commercial_notes,

      internal_reference,

      delivered_at,

      created_at,

      company:companies(
        id,
        name
      ),
      courier:profiles(
      id,
      full_name
     ),
    route:routes(
        id,
        name,
        estimated_hours,
        courier_routes(
          courier:couriers(id, active, profile:profiles(full_name, active, can_deliver))
        )
      ),
      district:districts(
  id,
  name,

  canton:cantons(
    id,
    name,

    province:provinces(
      id,
      name
    )
  )
),

neighborhood:neighborhoods(
  id,
  name,
  latitude,
  longitude
)
      `,
    )

    .eq("id", shipmentId)

    .single();

  if (error) {
    throw error;
  }


  return {
    ...data,

    courier:
      Array.isArray(
        data.courier,
      )
        ? data.courier[0] ?? null
        : data.courier,
    identification_type:
      Array.isArray(
        data.identification_type,
      )
        ? data.identification_type[0] ?? null
        : data.identification_type,

    company: Array.isArray(data.company)
      ? (data.company[0] ?? null)
      : data.company,

    route: (() => {
      const route = Array.isArray(data.route) ? (data.route[0] ?? null) : data.route;
      if (!route) return null;

      const courierNames = (route.courier_routes ?? [])
        .map((assignment: any) => {
          const courier = Array.isArray(assignment.courier) ? assignment.courier[0] : assignment.courier;
          const profile = Array.isArray(courier?.profile) ? courier.profile[0] : courier?.profile;
          return courier?.active === true && profile?.active === true && profile?.can_deliver === true
            ? profile.full_name
            : null;
        })
        .filter((name: string | null): name is string => Boolean(name))
        .sort((first: string, second: string) => first.localeCompare(second, "es"));

      return { ...route, courier_names: courierNames };
    })(),

    district: (() => {
      const district = Array.isArray(data.district)
        ? (data.district[0] ?? null)
        : data.district;

      if (!district) {
        return null;
      }

      const canton = Array.isArray(district.canton)
        ? (district.canton[0] ?? null)
        : district.canton;

      if (!canton) {
        return {
          ...district,
          canton: null,
        };
      }

      const province = Array.isArray(canton.province)
        ? (canton.province[0] ?? null)
        : canton.province;

      return {
        ...district,

        canton: {
          ...canton,

          province,
        },
      };
    })(),

    neighborhood: Array.isArray(data.neighborhood)
      ? (data.neighborhood[0] ?? null)
      : data.neighborhood,
  } as ShipmentDetail;
}
