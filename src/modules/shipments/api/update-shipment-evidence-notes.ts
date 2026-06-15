import { createClient } from "@/lib/supabase/client";

type Input = {
  evidenceId: string;
  notes: string;
};

export async function updateShipmentEvidenceNotes({
  evidenceId,
  notes,
}: Input) {
  const supabase = createClient();

  const { error } =
    await supabase
      .from(
        "shipment_evidences",
      )
      .update({
        notes,
      })
      .eq(
        "id",
        evidenceId,
      );

  if (error) {
    throw error;
  }
}