import { createClient } from "@/lib/supabase/client";

export async function reopenShipmentEvidences(
  shipmentId: string,
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("shipment_evidences")
    .update({
      validated: false,
      validated_at: null,
      validated_by: null,
    })
    .eq("shipment_id", shipmentId);

  if (error) {
    throw error;
  }
}