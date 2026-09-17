import { createClient } from "@/lib/supabase/client";

export type CompleteShipmentDeliveryInput = {
  shipmentId: string;
  deliveredBy: string;
  receiverType: "owner" | "authorized";
  depositAmount: number;
  shippingFee: number;
  observations: string;
  latitude: number;
  longitude: number;
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
    p_observations: input.observations,
    p_latitude: input.latitude,
    p_longitude: input.longitude,
  });

  if (error) {
    throw error;
  }
}
