import { createClient } from "@/lib/supabase/client";

export type DeliveredShipmentItem = {
  shipmentItemId: string;
  quantity: number;
};

export type CompleteShipmentDeliveryInput = {
  shipmentId: string;
  deliveredBy: string;
  receiverType: "owner" | "authorized";
  depositAmount: number;
  shippingFee: number;
  deliveredItems: DeliveredShipmentItem[];
  observations: string;
  latitude: number | null;
  longitude: number | null;
};

export async function completeShipmentDelivery(
  input: CompleteShipmentDeliveryInput,
) {
  const supabase = createClient();
  const { error } = await supabase.rpc("complete_shipment_delivery", {
    p_shipment_id: input.shipmentId,
    p_delivered_by: input.deliveredBy,
    p_receiver_type: input.receiverType,
    p_deposit_amount: input.depositAmount,
    p_shipping_fee: input.shippingFee,
    p_delivered_items: input.deliveredItems.map((item) => ({ item_id: item.shipmentItemId, quantity: item.quantity })),
    p_observations: input.observations,
    p_latitude: input.latitude,
    p_longitude: input.longitude,
  });

  if (error) {
    const message = [error.message, error.details, error.hint]
      .filter((value): value is string => Boolean(value))
      .join(" ");

    throw new Error(message || "No fue posible confirmar la entrega");
  }
}
