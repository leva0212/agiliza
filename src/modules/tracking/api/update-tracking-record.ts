import { createClient } from "@/lib/supabase/client";
import type { TrackingRecordInput } from "../types/tracking-record";

export async function updateTrackingRecord(
  recordId: string,
  input: TrackingRecordInput,
  canManageStatus: boolean,
) {
  const supabase = createClient();

  const payload = canManageStatus
    ? input
    : {
        full_name: input.full_name,
        identification: input.identification,
        province_id: input.province_id,
      };

  const { error } = await supabase
    .from("tracking_records")
    .update(payload)
    .eq("id", recordId);

  if (error) {
    throw error;
  }
}
