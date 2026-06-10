import { createClient } from "@/lib/supabase/client";

export async function getShipmentItems(
  shipmentId: string,
) {

  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase

    .from(
      "shipment_items",
    )

    .select(`
      id,

      shipment_id,

      product_id,

      quantity,

      deposit_amount,

      shipping_fee,

      barcode,

      serial_number,

      notes,

      created_at,

      product:products(
        id,
        name
      )
    `)

    .eq(
      "shipment_id",
      shipmentId,
    )

    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  if (error) {
    throw error;
  }

  return (

    data ?? []

  ).map(
    item => ({

      ...item,

      product:
        Array.isArray(
          item.product,
        )
          ? item.product[0] ?? null
          : item.product,

    }),
  );

}