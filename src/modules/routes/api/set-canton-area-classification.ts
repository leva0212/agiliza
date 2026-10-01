import { createClient } from "@/lib/supabase/client";

export type CantonAreaClassification = "gam" | "rural" | null;

export async function setCantonAreaClassification(
  cantonId: number,
  classification: CantonAreaClassification,
) {
  const supabase = createClient();
  const { error } = await supabase.rpc("set_canton_area_classification", {
    p_canton_id: cantonId,
    p_area_classification: classification,
  });

  if (error) throw error;
}
