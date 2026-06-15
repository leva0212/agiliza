import { createClient } from "@/lib/supabase/client";

type Input = {
  evidenceId: string;
  profileId: string;
};

export async function validateShipmentEvidence({
  evidenceId,
  profileId,
}: Input) {
  const supabase = createClient();

  const { error } = await supabase
    .from("shipment_evidences")
    .update({
      validated: true,

      validated_at:
        new Date().toISOString(),

      validated_by:
        profileId,
    })
    .eq("id", evidenceId);

  if (error) {
    throw error;
  }
}