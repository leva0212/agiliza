export type TrackingRecordHistoryEntry = {
  id: number;
  changed_at: string;
  field_name: string;
  previous_value: string | null;
  new_value: string | null;
  changed_by_profile: {
    full_name: string;
  } | null;
};
