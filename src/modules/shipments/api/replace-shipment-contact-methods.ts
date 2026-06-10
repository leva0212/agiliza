import { createClient } from "@/lib/supabase/client";

import type {
  CreateShipmentContactMethodInput,
} from "../types/shipment-contact-method";

type Input = {
  shipmentId: string;

  methods:
    CreateShipmentContactMethodInput[];
};

export async function replaceShipmentContactMethods(
  input: Input,
) {

  const supabase =
    createClient();

  const {
    error: deleteError,
  } = await supabase

    .from(
      "shipment_contact_methods",
    )

    .delete()

    .eq(
      "shipment_id",
      input.shipmentId,
    );

  if (
    deleteError
  ) {
    throw deleteError;
  }

  if (
    input.methods.length === 0
  ) {
    return;
  }

  const {
    error: insertError,
  } = await supabase

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

    );

  if (
    insertError
  ) {
    throw insertError;
  }

}