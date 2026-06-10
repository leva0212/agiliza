import { createClient } from "@/lib/supabase/client";

import type {
  CreateShipmentInput,
} from "../types/create-shipment";

type Input =
  CreateShipmentInput & {

    shipmentId: string;

  };

export async function updateShipment(
  input: Input,
) {

  const supabase =
    createClient();

    const {
  data: shipment,
} = await supabase

  .from(
    "shipments",
  )

  .select(
    "status",
  )

  .eq(
    "id",
    input.shipmentId,
  )

  .single();

let nextStatus =
  shipment?.status;

if (

  shipment?.status ===
    "created" ||

  shipment?.status ===
    "in_route"

) {

  nextStatus =

    input.route_id

      ? "in_route"

      : "created";

}

  const {
    data,
    error,
  } = await supabase

    .from(
      "shipments",
    )

    .update({

      receiver_name:
        input.receiver_name,

      receiver_type:
        input.receiver_type,

      district_id:
        input.district_id,

      neighborhood_id:
        input.neighborhood_id,

      route_id:
        input.route_id,

      customer_name:
        input.customer_name,

      customer_identification_type_id:
        input.customer_identification_type_id,

      customer_identification:
        input.customer_identification,

      customer_address:
        input.customer_address,

      latitude:
        input.latitude,

      longitude:
        input.longitude,

      notes:
        input.notes,

      commercial_notes:
        input.commercial_notes,

      internal_reference:
        input.internal_reference,
        status:
  nextStatus,

    })

    .eq(
      "id",
      input.shipmentId,
    )

    .select()

    .single();

  if (error) {

    throw error;

  }

  return data;

}