import { createClient } from "@/lib/supabase/client";

import type {
  ShipmentContactMethod,
} from "../types/shipment-contact-method";

export async function getShipmentContactMethods(
  shipmentId: string,
): Promise<
  ShipmentContactMethod[]
> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from(
      "shipment_contact_methods",
    )

    .select("*")

    .eq(
      "shipment_id",
      shipmentId,
    )

    .order(
      "is_primary",
      {
        ascending: false,
      },
    )

    .order(
      "contact_type",
      {
        ascending: true,
      },
    );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as ShipmentContactMethod[];

}