import { createClient } from "@/lib/supabase/client";

import type {
  CreateShipmentItemInput,
} from "../types/shipment-item";

type Input = {

  shipmentId: string;

  items:
    CreateShipmentItemInput[];

};

export async function replaceShipmentItems(
  input: Input,
) {

  const supabase =
    createClient();

  const {
    error: deleteError,
  } = await supabase

    .from(
      "shipment_items",
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
    input.items.length === 0
  ) {
    return;
  }

  const {
    error: insertError,
  } = await supabase

    .from(
      "shipment_items",
    )

    .insert(

      input.items.map(
        item => ({

          shipment_id:
            input.shipmentId,

          ...item,

        }),
      ),

    );

  if (
    insertError
  ) {
    throw insertError;
  }

}