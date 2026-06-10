import { createClient } from "@/lib/supabase/client";

import type { CreateShipmentInput } from "../types/create-shipment";

export async function createShipment(input: CreateShipmentInput) {
  const supabase = createClient();

  const { data, error } = await supabase

    .from("shipments")

    .insert({
      company_id: input.company_id,

      receiver_name: input.receiver_name,
      receiver_type:
        input.receiver_type,

      district_id: input.district_id,

      neighborhood_id: input.neighborhood_id,

      route_id: input.route_id,

      customer_name: input.customer_name,

      customer_identification_type_id: input.customer_identification_type_id,

      customer_identification: input.customer_identification,

      customer_address: input.customer_address,

      latitude: input.latitude,

      longitude: input.longitude,

      notes: input.notes,

      commercial_notes: input.commercial_notes,

      internal_reference: input.internal_reference,

      status:

        input.route_id

          ? "in_route"

          : "created",
      /*status:

  input.route_id

    ? "assigned"

    : "created",
     */
    })

    .select()

    .single();

  if (error) {
    throw error;
  }

  return data;
}
