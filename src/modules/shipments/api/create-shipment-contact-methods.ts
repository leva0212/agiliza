import {
  createClient,
} from "@/lib/supabase/client";

import type {
  CreateShipmentContactMethodInput,
  ShipmentContactMethod,
} from "../types/shipment-contact-method";

type Input = {
  shipmentId: string;

  methods:
    CreateShipmentContactMethodInput[];
};

export async function createShipmentContactMethods(
  input: Input,
): Promise<
  ShipmentContactMethod[]
> {

  if (
    input.methods.length === 0
  ) {
    return [];
  }

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "shipment_contact_methods",
      )

      .insert(

        input.methods.map(
          method => ({

            shipment_id:
              input.shipmentId,

            contact_name:
              method.contact_name,

            contact_type:
              method.contact_type,

            relationship:
              method.relationship ?? null,

            can_receive:
              method.can_receive ?? false,

            method_type:
              method.method_type,

            value:
              method.value,

            label:
              method.label ?? null,

            is_primary:
              method.is_primary ?? false,

            notes:
              method.notes ?? null,

          }),
        ),

      )

      .select();

  if (error) {
    throw error;
  }

  return (
    data ??
    []
  ) as ShipmentContactMethod[];
}