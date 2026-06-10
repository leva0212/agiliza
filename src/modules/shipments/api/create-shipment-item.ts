import {
  createClient,
} from "@/lib/supabase/client";

import type {
  CreateShipmentItemInput,
  ShipmentItem,
} from "../types/shipment-item";

type Input = {
  shipmentId: string;

  items:
    CreateShipmentItemInput[];
};

export async function createShipmentItems(
  input: Input,
): Promise<
  ShipmentItem[]
> {

  if (
    input.items.length === 0
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
        "shipment_items",
      )

      .insert(

        input.items.map(
          item => ({

            shipment_id:
              input.shipmentId,

            product_id:
              item.product_id,

            quantity:
              item.quantity,

            serial_number:
              item.serial_number || null,

            barcode:
              item.barcode || null,

            deposit_amount:
              item.deposit_amount,

            shipping_fee:
              item.shipping_fee,

            notes:
              item.notes || null,

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
  ) as ShipmentItem[];
}