import { createClient } from "@/lib/supabase/client";
import type { TrackingRecordHistoryEntry } from "../types/tracking-record-history";

export async function getTrackingRecordHistory(recordId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tracking_record_history")
    .select(`
      id,
      changed_at,
      field_name,
      previous_value,
      new_value,
      changed_by_profile:profiles!tracking_record_history_changed_by_profile_id_fkey(
        full_name
      )
    `)
    .eq("tracking_record_id", recordId)
    .order("changed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((entry) => ({
    ...entry,
    changed_by_profile: Array.isArray(entry.changed_by_profile)
      ? entry.changed_by_profile[0] ?? null
      : entry.changed_by_profile,
  })) as TrackingRecordHistoryEntry[];
}
