import { createClient } from "@/lib/supabase/client";

export async function unvalidateShipmentEvidence(
  evidenceId: string,
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("shipment_evidences")
    .update({
      validated: false,

      validated_at: null,

      validated_by: null,
    })
    .eq("id", evidenceId);

  if (error) {
    throw error;
  }
}