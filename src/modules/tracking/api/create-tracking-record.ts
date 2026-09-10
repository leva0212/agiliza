import { createClient } from "@/lib/supabase/client";
import type { TrackingRecordInput } from "../types/tracking-record";

export async function createTrackingRecord(
  input: TrackingRecordInput,
  canManageStatus: boolean,
) {
  const supabase = createClient();

  const payload = canManageStatus
    ? input
    : {
        company_id: input.company_id,
        full_name: input.full_name,
        identification: input.identification,
        province_id: input.province_id,
      };

  const { error } = await supabase
    .from("tracking_records")
    .insert(payload);

  if (error) {
    throw error;
  }
}
